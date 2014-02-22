#!/usr/bin/python -OO
# Copyright 2008-2009 The SABnzbd-Team <team@sabnzbd.org>
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

"""
sabnzbd.misc - misc classes
"""
__NAME__ = "sabnzbd.misc"

import os
import sys
import time
import logging
import Queue
import sabnzbd
import cherrypy
import urllib
import re
import zipfile
import gzip
import webbrowser
import tempfile
import shutil

try:
    # Try to import OSX library
    import Foundation
    HAVE_FOUNDATION = True
except:
    HAVE_FOUNDATION = False

from threading import *
from sabnzbd.decorators import *
from sabnzbd.nzbstuff import NzbObject
from sabnzbd.constants import *
from sabnzbd.utils.rarfile import is_rarfile, RarFile

RE_VERSION = re.compile('(\d+)\.(\d+)\.(\d+)([a-zA-Z]*)(\d*)')
RE_UNITS = re.compile('(\d+\.*\d*)\s*([KMGTP]*)', re.I)
TAB_UNITS = ('', 'K', 'M', 'G', 'T', 'P')
RE_CAT = re.compile(r'^{{(\w+)}}(.+)') # Category prefix

PANIC_NONE  = 0
PANIC_PORT  = 1
PANIC_TEMPL = 2
PANIC_QUEUE = 3
PANIC_FWALL = 4
PANIC_OTHER = 5
PW_PREFIX = '!!!encoded!!!'


def CompareStat(tup1, tup2):
    """ Test equality of two stat-tuples, content-related parts only """
    if tup1.st_ino   != tup2.st_ino:   return False
    if tup1.st_size  != tup2.st_size:  return False
    if tup1.st_mtime != tup2.st_mtime: return False
    if tup1.st_ctime != tup2.st_ctime: return False
    return True


def Cat2Opts(cat, pp, script):
    """
        Derive options from category, if option not already defined.
        Specified options have priority over category-options
    """
    if not pp:
        try:
            pp = sabnzbd.CFG['categories'][cat.lower()]['pp']
            logging.debug('[%s] Job gets options %s', __NAME__, pp)
        except:
            pp = sabnzbd.DIRSCAN_PP

    if not script:
        try:
            script = sabnzbd.CFG['categories'][cat.lower()]['script']
            logging.debug('[%s] Job gets script %s', __NAME__, script)
        except:
            script = sabnzbd.DIRSCAN_SCRIPT

    return cat, pp, script


def Cat2OptsDef(fname, cat=None):
    """
        Get options associated with the category.
        Category options have priority over default options.
    """
    pp = sabnzbd.DIRSCAN_PP
    script = sabnzbd.DIRSCAN_SCRIPT
    name = fname

    if cat == None:
        m = RE_CAT.search(fname)
        if m and m.group(1) and m.group(2):
            cat = m.group(1).lower()
            name = m.group(2)
            logging.debug('[%s] Job %s has category %s', __NAME__, name, cat)

    if cat:
        try:
            pp = sabnzbd.CFG['categories'][cat.lower()]['pp']
            logging.debug('[%s] Job %s gets options %s', __NAME__, name, pp)
        except:
            pass

        try:
            script = sabnzbd.CFG['categories'][cat.lower()]['script']
            logging.debug('[%s] Job %s gets script %s', __NAME__, name, script)
        except:
            pass

    return cat, name, pp, script


def ProcessArchiveFile(filename, path, pp=None, script=None, cat=None, catdir=None):
    """ Analyse ZIP file and create job(s).
        Accepts ZIP files with ONLY nzb/nfo/folder files in it.
        returns: -1==Error/Retry, 0==OK, 1==Ignore
    """
    if catdir == None:
        catdir = cat

    _cat, name, _pp, _script = Cat2OptsDef(filename, catdir)
    if cat == None: cat = _cat
    if pp == None: pp = _pp
    if script == None: script = _script

    if path.endswith('.zip'):
        try:
            zf = zipfile.ZipFile(path)
        except:
            return -1
    elif is_rarfile(path):
        try:
            zf = RarFile(path)
        except:
            return -1
    else:
        return -1

    ok = False
    for name in zf.namelist():
        name = name.lower()
        if not (name.endswith('.nzb') or name.endswith('.nfo') or name.endswith('/')):
            ok = False
            break
        elif name.endswith('.nzb'):
            ok = True
    if ok:
        for name in zf.namelist():
            if name.lower().endswith('.nzb'):
                try:
                    data = zf.read(name)
                except:
                    zf.close()
                    return -1
                name = os.path.basename(name)
                name = sanitize_foldername(name)
                name = name.replace('[nzbmatrix.com]','')
                if data:
                    try:
                        nzo = NzbObject(name, pp, script, data, cat=cat)
                    except:
                        nzo = None
                    if nzo:
                        sabnzbd.add_nzo(nzo)
        zf.close()
        try:
            os.remove(path)
        except:
            logging.error("[%s] Error removing %s", __NAME__, path)
            ok = 1
    else:
        zf.close()
        ok = 1

    return ok


def ProcessSingleFile(filename, path, pp=None, script=None, cat=None, catdir=None):
    """ Analyse file and create a job from it
        Supports NZB, NZB.GZ and GZ.NZB-in-disguise
        returns: -2==Error/retry, -1==Error, 0==OK, 1==OK-but-ignorecannot-delete
    """
    if catdir == None:
        catdir = cat

    try:
        f = open(path, 'rb')
        b1 = f.read(1)
        b2 = f.read(1)
        f.close()

        if (b1 == '\x1f' and b2 == '\x8b'):
            # gzip file or gzip in disguise
            name = filename.replace('.nzb.gz', '.nzb')
            f = gzip.GzipFile(path, 'rb')
        else:
            name = filename
            f = open(path, 'rb')
        data = f.read()
        f.close()
    except:
        logging.warning('[%s] Cannot read %s', __NAME__, path)
        return False

    if name:
        name = sanitize_foldername(name)

    _cat, name, _pp, _script = Cat2OptsDef(name, catdir)
    if cat == None: cat = _cat
    if pp == None: pp = _pp
    if script == None: script = _script

    try:
        nzo = NzbObject(name, pp, script, data, cat=cat)
    except TypeError:
        # Duplicate, ignore
        nzo = None
    except:
        if data.find("<nzb") >= 0 and data.find("</nzb") < 0:
            # Looks like an incomplete file, retry
            return -2
        else:
            return -1

    if nzo:
        sabnzbd.add_nzo(nzo)
    try:
        os.remove(path)
    except:
        logging.error("[%s] Error removing %s", __NAME__, path)
        return 1

    return 0


def CleanList(list, folder, files):
    """ Remove elements of "list" not found in "files" """
    for path in sorted(list.keys()):
        fld, name = os.path.split(path)
        if fld == folder:
            present = False
            for name in files:
                if os.path.join(folder, name) == path:
                    present = True
                    break
            if not present:
                del list[path]


#------------------------------------------------------------------------------
class DirScanner(Thread):
    """
    Thread that periodically scans a given directoty and picks up any
    valid NZB, NZB.GZ ZIP-with-only-NZB and even NZB.GZ named as .NZB
    Candidates which turned out wrong, will be remembered and skipped in
    subsequent scans, unless changed.
    """
    def __init__(self, dirscan_dir, dirscan_speed):
        Thread.__init__(self)

        self.dirscan_dir = dirscan_dir
        self.dirscan_speed = dirscan_speed

        try:
            dir, self.ignored, self.suspected = sabnzbd.load_data(SCAN_FILE_NAME, remove = False)
            if dir != dirscan_dir:
                self.ignored = {}
                self.suspected = {}
        except:
            self.ignored = {}   # Will hold all unusable files and the
                                # successfully processed ones that cannot be deleted
            self.suspected = {} # Will hold name/attributes of suspected candidates

        self.shutdown = False
        self.error_reported = False # Prevents mulitple reporting of missing watched folder

    def stop(self):
        self.save()
        logging.info('[%s] Dirscanner shutting down', __NAME__)
        self.shutdown = True

    def save(self):
        sabnzbd.save_data((self.dirscan_dir, self.ignored, self.suspected), sabnzbd.SCAN_FILE_NAME)

    def run(self):
        def run_dir(folder, catdir):
            try:
                files = os.listdir(folder)
            except:
                if not self.error_reported and not catdir:
                    logging.error("Cannot read Watched Folder %s", folder)
                    self.error_reported = True
                files = []

            for filename in files:
                path = os.path.join(folder, filename)
                if os.path.isdir(path) or path in self.ignored:
                    continue

                root, ext = os.path.splitext(path)
                ext = ext.lower()
                candidate = ext in ('.nzb', '.zip', '.gz', '.rar')
                if candidate:
                    try:
                        stat_tuple = os.stat(path)
                    except:
                        continue
                else:
                    self.ignored[path] = 1

                if path in self.suspected:
                    if CompareStat(self.suspected[path], stat_tuple):
                        # Suspected file still has the same attributes
                        continue
                    else:
                        del self.suspected[path]

                if candidate and stat_tuple.st_size > 0:
                    logging.info('[%s] Trying to import %s', __NAME__, path)

                    # Wait until the attributes are stable for 1 second
                    # but give up after 3 sec
                    stable = False
                    for n in xrange(3):
                        time.sleep(1.0)
                        try:
                            stat_tuple_tmp = os.stat(path)
                        except:
                            continue
                        if CompareStat(stat_tuple, stat_tuple_tmp):
                            stable = True
                            break
                        else:
                            stat_tuple = stat_tuple_tmp

                    if not stable:
                        continue

                    # Handle ZIP files, but only when containing just NZB files
                    if ext in ('.zip', '.rar') :
                        res = ProcessArchiveFile(filename, path, catdir=catdir)
                        if res == -1:
                            self.suspected[path] = stat_tuple
                        elif res == 0:
                            self.error_reported = False
                        else:
                            self.ignored[path] = 1

                    # Handle .nzb, .nzb.gz or gzip-disguised-as-nzb
                    elif ext == '.nzb' or filename.lower().endswith('.nzb.gz'):
                        res = ProcessSingleFile(filename, path, catdir=catdir)
                        if res < 0:
                            self.suspected[path] = stat_tuple
                        elif res == 0:
                            self.error_reported = False
                        else:
                            self.ignored[path] = 1

                    else:
                        self.ignored[path] = 1

            CleanList(self.ignored, folder, files)
            CleanList(self.suspected, folder, files)

        logging.info('[%s] Dirscanner starting up', __NAME__)
        self.shutdown = False

        while not self.shutdown:
            # Use variable scan delay
            x = self.dirscan_speed
            while (x > 0) and not self.shutdown:
                time.sleep(1.0)
                x = x - 1

            if not self.shutdown:
                run_dir(self.dirscan_dir, None)

                try:
                    list = os.listdir(self.dirscan_dir)
                except:
                    if not self.error_reported:
                        logging.error("Cannot read Watched Folder %s", self.dirscan_dir)
                        self.error_reported = True
                    list = []

                for dd in list:
                    dpath = os.path.join(self.dirscan_dir, dd)
                    if os.path.isdir(dpath) and dd.lower() in sabnzbd.CFG['categories']:
                        run_dir(dpath, dd.lower())


#------------------------------------------------------------------------------
class URLGrabber(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.queue = Queue.Queue()
        for tup in sabnzbd.NZBQ.get_urls():
            self.queue.put(tup)
        self.shutdown = False

    def add(self, url, future_nzo):
        """ Add an URL to the URLGrabber queue """
        self.queue.put((url, future_nzo))

    def stop(self):
        logging.info('[%s] URLGrabber shutting down', __NAME__)
        self.shutdown = True
        self.queue.put((None, None))

    def run(self):
        logging.info('[%s] URLGrabber starting up', __NAME__)
        self.shutdown = False

        while not self.shutdown:
            (url, future_nzo) = self.queue.get()
            if not url:
                continue

            # If nzo entry deleted, give up
            try:
                deleted = future_nzo.deleted
            except:
                deleted = True
            if deleted:
                logging.debug('[%s] Dropping URL %s, job entry missing', __NAME__, url)
                continue

            try:
                logging.info('[%s] Grabbing URL %s', __NAME__, url)
                opener = urllib.FancyURLopener({})
                opener.prompt_user_passwd = None
                opener.addheader('Accept-encoding','gzip')
                fn, header = opener.retrieve(url)

                filename, data = (None, None)

                for tup in header.items():
                    for item in tup:
                        if "filename=" in item:
                            filename = item[item.index("filename=") + 9:].strip('"')
                            break

                _r, _u, _d = future_nzo.get_repair_opts()
                pp = sabnzbd.opts_to_pp(_r, _u, _d)
                script = future_nzo.get_script()
                cat = future_nzo.get_cat()
                cat, pp, script = Cat2Opts(cat, pp, script)

                res = ProcessSingleFile(filename, fn, pp=pp, script=script, cat=cat)
                if res == 0:
                    sabnzbd.remove_nzo(future_nzo.nzo_id, add_to_history=False, unload=True)
                elif res == -2:
                    self.add(url, future_nzo)
                else:
                    BadFetch(future_nzo, url)
            except:
                BadFetch(future_nzo, url)

            # Don't pound the website!
            time.sleep(1.0)


################################################################################
# sanitize_filename                                                            #
################################################################################
if os.name == 'nt':
    CH_ILLEGAL = r'\/<>?*:|"'
    CH_LEGAL   = r'++{}!@-#`'
else:
    CH_ILLEGAL = r'/'
    CH_LEGAL   = r'+'

def sanitize_filename(name):
    """ Return filename with illegal chars converted to legal ones
        and with the par2 extension always in lowercase
    """
    illegal = CH_ILLEGAL
    legal   = CH_LEGAL

    lst = []
    for ch in name.strip():
        if ch in illegal:
            ch = legal[illegal.find(ch)]
        lst.append(ch)
    name = ''.join(lst)

    if not name:
        name = 'unknown'

    name, ext = os.path.splitext(name)
    lowext = ext.lower()
    if lowext == '.par2' and lowext != ext:
        ext = lowext
    return name + ext


def sanitize_foldername(name):
    """ Return foldername with dodgy chars converted to safe ones
        Remove any leading and trailing dot characters
    """
    illegal = r'\/<>?*:|"'
    legal   = r'++{}!@-#`'

    repl = sabnzbd.REPLACE_ILLEGAL
    lst = []
    for ch in name.strip():
        if ch in illegal:
            if repl:
                ch = legal[illegal.find(ch)]
                lst.append(ch)
        else:
            lst.append(ch)
    name = ''.join(lst)

    name = name.strip('.')
    if not name:
        name = 'unknown'

    return name


################################################################################
# DirPermissions                                                               #
################################################################################
def CreateAllDirs(path, umask=None):
    """ Create all required path elements and set umask on all
        Return True if last element could be made or exists """
    result = True
    if os.name == 'nt':
        try:
            os.makedirs(path)
        except:
            result = False
    else:
        list = []
        list.extend(path.split('/'))
        path = ''
        for d in list:
            if d:
                path += '/' + d
                if not os.path.exists(path):
                    try:
                        os.mkdir(path)
                        try:
                            if umask: os.chmod(path, int(umask, 8) | 0700)
                        except:
                            pass
                        result = True
                    except:
                        result = False
    return result

################################################################################
# Real_Path                                                                    #
################################################################################
def real_path(loc, path):
    path = path.strip()
    if not ((os.name == 'nt' and len(path)>1 and path[0].isalpha() and path[1] == ':') or \
            (path and (path[0] == '/' or path[0] == '\\'))
           ):
        path = loc + '/' + path
    return os.path.normpath(os.path.abspath(path))


################################################################################
# Create_Real_Path                                                             #
################################################################################
def create_real_path(name, loc, path, umask=None):
    if path:
        my_dir = real_path(loc, path)
        if not os.path.exists(my_dir):
            logging.info('%s directory: %s does not exist, try to create it', name, my_dir)
            if not CreateAllDirs(my_dir, umask):
                logging.error('[%s] Cannot create directory %s', __NAME__, my_dir)
                return (False, my_dir)

        if os.access(my_dir, os.R_OK + os.W_OK):
            return (True, my_dir)
        else:
            logging.error('%s directory: %s error accessing', name, my_dir)
            return (False, my_dir)
    else:
        return (False, "")

################################################################################
# Get_User_ShellFolders
#
# Return a dictionary with Windows Special Folders
# Read info from the registry
################################################################################

def Get_User_ShellFolders():
    import _winreg
    dict = {}

    # Open registry hive
    try:
        hive = _winreg.ConnectRegistry(None, _winreg.HKEY_CURRENT_USER)
    except WindowsError:
        logging.error("Cannot connect to registry hive HKEY_CURRENT_USER.")
        return dict

    # Then open the registry key where Windows stores the Shell Folder locations
    try:
        key = _winreg.OpenKey(hive, "Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders")
    except WindowsError:
        logging.error("Cannot open registry key Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders.")
        _winreg.CloseKey(hive)
        return dict

    try:
        for i in range(0, _winreg.QueryInfoKey(key)[1]):
            name, value, val_type = _winreg.EnumValue(key, i)
            try:
                dict[name] = value.encode('latin-1')
            except:
                try:
                    import win32api
                    dict[name] = win32api.GetShortPathName(value)
                except:
                    del dict[name]
            i += 1
        _winreg.CloseKey(key)
        _winreg.CloseKey(hive)
        return dict
    except WindowsError:
        # On error, return empty dict.
        logging.error("Failed to read registry keys for special folders")
        _winreg.CloseKey(key)
        _winreg.CloseKey(hive)
        return {}


################################################################################
# save_configfile
#
################################################################################
def save_configfile(cfg):
    """Save configuration to disk
    """
    try:
        cfg.write()
        f = open(cfg.filename)
        x = f.read()
        f.close()
        f = open(cfg.filename, "w")
        f.write(x)
        f.flush()
        f.close()
    except:
        Panic('Cannot write to configuration file "%s".' % cfg.filename, \
              'Make sure file is writable and in a writable folder.')
        ExitSab(2)

################################################################################
# Launch a browser for various purposes
# including panic messages
#
################################################################################
MSG_BAD_NEWS = r'''
    <html>
    <head>
    <title>Problem with %s %s</title>
    </head>
    <body>
    <h1><font color="#0000FF">Welcome to %s %s</font></h1>
    <p align="center">&nbsp;</p>
    <p align="center"><font size="5">
    <blockquote>
        %s
    </blockquote>
    <br>Program did not start!<br>
    </body>
</html>
'''

MSG_BAD_FWALL = r'''
    SABnzbd is not compatible with some software firewalls.<br>
    %s<br>
    Sorry, but we cannot solve this incompatibility right now.<br>
    Please file a complaint at your firewall supplier.<br>
    <br>
'''

MSG_BAD_PORT = r'''
    SABnzbd needs a free tcp/ip port for its internal web server.<br>
    Port %s on %s was tried , but it is not available.<br>
    Some other software uses the port or SABnzbd is already running.<br>
    <br>
    Please restart SABnzbd with a different port number.<br>
    <br>
    %s<br>
      &nbsp;&nbsp;&nbsp;&nbsp;%s --server %s:%s<br>
    <br>
    If you get this error message again, please try a different number.<br>
'''

MSG_BAD_QUEUE = r'''
    SABnzbd detected saved data from an other SABnzbd version<br>
    but cannot re-use the data of the other program.<br><br>
    You may want to finish your queue first with the other program.<br><br>
    After that, start this program with the "--clean" option.<br>
    This will erase the current queue and history!<br>
    SABnzbd read the file "%s".<br>
    <br>
    %s<br>
      &nbsp;&nbsp;&nbsp;&nbsp;%s --clean<br>
    <br>
'''

MSG_BAD_TEMPL = r'''
    SABnzbd cannot find its web interface files in %s.<br>
    Please install the program again.<br>
    <br>
'''

MSG_OTHER = r'''
    SABnzbd detected a fatal error:<br>
    %s<br><br>
    %s<br>
'''

def panic_message(panic, a=None, b=None):
    """Create the panic message from templates
    """
    if (not sabnzbd.AUTOBROWSER) or sabnzbd.DAEMON:
        return

    if os.name == 'nt':
        os_str = 'Press Startkey+R and type the line (example):'
        prog_path = '"%s"' % sabnzbd.MY_FULLNAME
    else:
        os_str = 'Open a Terminal window and type the line (example):'
        prog_path = sabnzbd.MY_FULLNAME

    if panic == PANIC_PORT:
        newport = int(b) + 1
        newport = "%s" % newport
        msg = MSG_BAD_PORT % (b, a, os_str, prog_path, a, newport)
    elif panic == PANIC_TEMPL:
        msg = MSG_BAD_TEMPL % a
    elif panic == PANIC_QUEUE:
        msg = MSG_BAD_QUEUE % (a, os_str, prog_path)
    elif panic == PANIC_FWALL:
        if a:
            msg = MSG_BAD_FWALL % "It is likely that you are using ZoneAlarm on Vista.<br>"
        else:
            msg = MSG_BAD_FWALL % "<br>"
    else:
        msg = MSG_OTHER % (a, b)


    msg = MSG_BAD_NEWS % (sabnzbd.MY_NAME, sabnzbd.__version__, sabnzbd.MY_NAME, sabnzbd.__version__, msg)

    msgfile, url = tempfile.mkstemp(suffix='.html')
    os.write(msgfile, msg)
    os.close(msgfile)
    return url


def Panic_FWall(vista):
    launch_a_browser(panic_message(PANIC_FWALL, vista))

def Panic_Port(host, port):
    launch_a_browser(panic_message(PANIC_PORT, host, port))

def Panic_Queue(name):
    launch_a_browser(panic_message(PANIC_QUEUE, name, 0))

def Panic_Templ(name):
    launch_a_browser(panic_message(PANIC_TEMPL, name, 0))

def Panic(reason, remedy=""):
    print "\nFatal error:\n  %s\n%s" % (reason, remedy)
    launch_a_browser(panic_message(PANIC_OTHER, reason, remedy))


def launch_a_browser(url):
    """Launch a browser pointing to the URL
    """
    if (not sabnzbd.AUTOBROWSER) or sabnzbd.DAEMON:
        return

    logging.info("Lauching browser with %s", url)
    try:
        webbrowser.open(url, 2, 1)
    except:
        # Python 2.4 does not support parameter new=2
        try:
            webbrowser.open(url, 1, 1)
        except:
            logging.warning("Cannot launch the browser, probably not found")


################################################################################
# Check latest version
#
# Perform an online version check
# Syntax of online version file:
#     <current-final-release>
#     <url-of-current-final-release>
#     <latest-beta-or-rc>
#     <url-of-latest-beta/rc-release>
# The latter two lines are only present when a beta/rc is available.
# Formula for the version numbers (line 1 and 3).
# - <major>.<minor>.<bugfix>[rc|beta]<cand>
#
# The <cand> value for a final version is assumned to be 99.
# The <cand> value for the beta/rc version is 1..49, with RC getting
# a boost of 50.
# This is done to signal beta/rc users of availability of the final
# version (which is implicitly 99).
# People will only be informed to upgrade to a higher beta/rc version, if
# they are already using a beta/rc.
# RC's are valued higher than Beta's.
#
################################################################################

def ConvertVersion(text):
    """ Convert version string to numerical value and a testversion indicator """
    version = 0
    test = True
    m = RE_VERSION.search(text)
    if m:
        version = int(m.group(1))*1000000 + int(m.group(2))*10000 + int(m.group(3))*100
        try:
            if m.group(4).lower() == 'rc':
                version = version + 50
            version = version + int(m.group(5))
        except:
            version = version + 99
            test = False
    return version, test


def check_latest_version():
    """ Do an online check for the latest version """
    current, testver = ConvertVersion(sabnzbd.__version__)
    if not current:
        logging.debug("[%s] Unsupported release number (%s), will not check", __NAME__, sabnzbd.__version__)
        return

    try:
        fn = urllib.urlretrieve('http://sabnzbdplus.sourceforge.net/version/latest')[0]
        f = open(fn, 'r')
        data = f.read()
        f.close()
    except:
        return

    try:
        latest_label = data.split()[0]
    except:
        latest_label = ''
    try:
        url = data.split()[1]
    except:
        url = ''
    try:
        latest_testlabel = data.split()[2]
    except:
        latest_testlabel = ''
    try:
        url_beta = data.split()[3]
    except:
        url_beta = url


    latest, dummy = ConvertVersion(latest_label)
    latest_test, dummy = ConvertVersion(latest_testlabel)

    logging.debug("Checked for a new release, cur= %s, latest= %s (on %s)", current, latest, url)

    if testver and current < latest:
        sabnzbd.NEW_VERSION = "%s;%s" % (latest_label, url)
    elif current < latest:
        sabnzbd.NEW_VERSION = "%s;%s" % (latest_label, url)
    elif testver and current < latest_test:
        sabnzbd.NEW_VERSION = "%s;%s" % (latest_testlabel, url_beta)


def from_units(val):
    """ Convert K/M/G/T/P notation to float
    """
    val = str(val).strip().upper()
    if val == "-1":
        return val
    m = RE_UNITS.search(val)
    if m:
        if m.group(2):
            val = float(m.group(1))
            unit = m.group(2)
            n = 0
            while unit != TAB_UNITS[n]:
                val = val * 1024.0
                n = n+1
        else:
            val = m.group(1)
        try:
            return float(val)
        except:
            return 0.0
    else:
        return 0.0

def to_units(val):
    """ Convert number to K/M/G/T/P notation
    """
    val = str(val).strip()
    if val == "-1":
        return val
    n= 0
    val = float(val)
    while (val > 1023.0) and (n < 5):
        val = val / 1024.0
        n= n+1
    unit = TAB_UNITS[n]
    if unit:
        return "%.1f %s" % (val, unit)
    else:
        return "%.0f" % val

#------------------------------------------------------------------------------
def SameFile(a, b):
    """ Return True if both paths are identical """

    if "samefile" in os.path.__dict__:
        try:
            return os.path.samefile(a, b)
        except:
            return False
    else:
        try:
            a = os.path.normpath(os.path.abspath(a)).lower()
            b = os.path.normpath(os.path.abspath(b)).lower()
            return a == b
        except:
            return False

#------------------------------------------------------------------------------
def ExitSab(value):
    sys.stderr.flush()
    sys.stdout.flush()
    sys.exit(value)


#------------------------------------------------------------------------------
def encodePassword(pw):
    """ Encode password in hexadecimal if needed """
    enc = False
    if pw:
        encPW = PW_PREFIX
        for c in pw:
            cnum = ord(c)
            if c == '#' or cnum<33 or cnum>126:
                enc = True
            encPW += '%2x' % cnum
        if enc:
            return encPW
    return pw


def decodePassword(pw, name):
    """ Decode hexadecimal encoded password
        but only decode when prefixed
    """
    decPW = ''
    if pw.startswith(PW_PREFIX):
        for n in range(len(PW_PREFIX), len(pw), 2):
            try:
                ch = chr( int(pw[n] + pw[n+1],16) )
            except:
                logging.error('[%s] Incorrectly encoded password %s', __NAME__, name)
                return ''
            decPW += ch
        return decPW
    else:
        return pw

#------------------------------------------------------------------------------
def Notify(notificationName, message):
    """ Send a notification to the OS (OSX-only) """
    if HAVE_FOUNDATION:
        pool = Foundation.NSAutoreleasePool.alloc().init()
        nc = Foundation.NSDistributedNotificationCenter.defaultCenter()
        nc.postNotificationName_object_(notificationName, message)
        del pool


#------------------------------------------------------------------------------
def SplitHost(srv):
    """ Split host:port notation, allowing for IPV6 """
    # Cannot use split, because IPV6 of "a:b:c:port" notation
    # Split on the last ':'
    mark = srv.rfind(':')
    if mark < 0:
        host = srv
    else:
        host = srv[0 : mark]
        port = srv[mark+1 :]
    try:
        port = int(port)
    except:
        port = None
    return (host, port)


#------------------------------------------------------------------------------
# Locked directory operations

DIR_LOCK = RLock()

@synchronized(DIR_LOCK)
def get_unique_path(dirpath, n=0, create_dir=True):
    """ Determine a unique folder or filename """
    path = dirpath
    if n: path = "%s.%s" % (dirpath, n)

    if not os.path.exists(path):
        if create_dir: create_dirs(path)
        return path
    else:
        return get_unique_path(dirpath, n=n+1, create_dir=create_dir)

@synchronized(DIR_LOCK)
def get_unique_filename(path, new_path, i=1):
    #path = existing path of the file, new_path = destination
    if os.path.exists(new_path):
        p, fn = os.path.split(path)
        name, ext = os.path.splitext(fn)
        uniq_name = "%s.%s%s" % (name,i,ext)
        uniq_path = new_path.replace(fn,uniq_name)
        if os.path.exists(uniq_path):
            path, uniq_path = get_unique_filename(path, new_path, i=i+1)
        else:
            try:
                os.rename(path, uniq_path)
                path = path.replace(fn, uniq_name)
            except:
                return path, new_path
        return path, uniq_path

    else:
        return path, new_path


@synchronized(DIR_LOCK)
def create_dirs(dirpath):
    """ Create directory tree, obeying permissions """
    if not os.path.exists(dirpath):
        logging.info('[%s] Creating directories: %s', __NAME__, dirpath)
        if not CreateAllDirs(dirpath, sabnzbd.UMASK):
            logging.error("[%s] Failed making (%s)",__NAME__,dirpath)
            return None
    return dirpath


@synchronized(DIR_LOCK)
def move_to_path(path, new_path, unique=True):
    """ Move a file to a new path, optionally give unique filename """
    if unique:
        new_path = get_unique_path(new_path, create_dir=False)
    if new_path:
        logging.debug("[%s] Moving. Old path:%s new path:%s unique?:%s",
                                                  __NAME__,path,new_path, unique)
        try:
            # First try cheap rename
            os.rename(path, new_path)
        except:
            # Cannot rename, try copying
            try:
                if not os.path.exists(os.path.dirname(new_path)):
                    create_dirs(os.path.dirname(new_path))
                shutil.copyfile(path, new_path)
                os.remove(path)
            except:
                logging.error("[%s] Failed moving %s to %s", __NAME__, path, new_path)
    return new_path


@synchronized(DIR_LOCK)
def cleanup_empty_directories(path):
    path = os.path.normpath(path)
    while 1:
        repeat = False
        for root, dirs, files in os.walk(path, topdown=False):
            if not dirs and not files and root != path:
                try:
                    os.rmdir(root)
                    repeat = True
                except:
                    pass
        if not repeat:
            break


@synchronized(DIR_LOCK)
def getFilepath(path, nzo, filename):
    """ Create unique filepath """
    # This procedure is only used by the Assembler thread
    # It does no umask setting
    # It uses the dir_lock for the (rare) case that the
    # download_dir is equal to the complete_dir.
    dirname = nzo.get_dirname()
    created = nzo.get_dirname_created()

    dName = dirname
    if not created:
        for n in xrange(200):
            dName = dirname
            if n: dName += '.' + str(n)
            try:
                os.mkdir(os.path.join(path, dName))
                break
            except:
                pass
        nzo.set_dirname(dName, created = True)

    fPath = os.path.join(os.path.join(path, dName), filename)
    n = 0
    while True:
        fullPath = fPath
        if n: fullPath += '.' + str(n)
        if os.path.exists(fullPath):
            n = n + 1
        else:
            break

    return fullPath


def BadFetch(nzo, url):
    """ Create History entry for failed URL Fetch """
    logging.error("[%s] Error getting url %s", __NAME__, url)

    pp = nzo.get_pp()
    if pp:
        pp = '&pp=%s' % pp
    else:
        pp = ''
    cat = nzo.get_cat()
    if cat:
        cat = '&cat=%s' % cat
    else:
        cat = ''
    script = nzo.get_script()
    if script:
        script = '&script=%s' % script
    else:
        script = ''

    nzo.set_status("Failed")

    if url.find('://') < 0:
        nzo.set_filename('Failed to fetch newzbin report %s' % url)
    else:
        nzo.set_filename('Failed to fetch NZB from %s' % url)

    nzo.set_unpackstr('=> Failed, <a href="./retry?session=%s&url=%s%s%s%s">Try again</a>' % \
                     (sabnzbd.API_KEY, urllib.quote(url), pp, urllib.quote(cat), urllib.quote(script)),
                     '[URL Fetch]', 0)
    sabnzbd.remove_nzo(nzo.nzo_id, add_to_history=True, unload=True)

def create_api_key():
    try:
        from hashlib import md5
    except ImportError:
        from md5 import md5
    import random
    # Create some values to seed md5
    t = str(time.time())
    r = str(random.random())
    # Create the md5 instance and give it the current time
    m = md5(t)
    # Update the md5 instance with the random variable
    m.update(r)

    # Return a hex digest of the md5, eg 49f68a5c8493ec2c0bf489821c21fc3b
    return m.hexdigest()
