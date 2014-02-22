*************************************
*** This is SABnzbd 0.4.11        ***
*************************************
SABnzbd is an open-source cross-platform binary newsreader.
It simplifies the process of downloading from Usenet dramatically,
thanks to its friendly web-based user interface and advanced
built-in post-processing options that automatically verify, repair,
extract and clean up posts downloaded from Usenet.
SABnzbd also has a fully customizable user interface,
and offers a complete API for third-party applications to hook into.

There is an extensive Wiki on the use of SABnzbd.
http://sabnzbd.wikidot.com/


**********************************************
*** Upgrading from 0.4.2/.../0.4.6         ***
**********************************************
Just install over the existing installation,
and you will be able to resume where you left off.


**************************************
*** Upgrading from 0.4.1 and older ***
**************************************
Do *not* install the new version over the old one.
Remove old one first or install seperately.
You can re-use your sabnzbd.ini file.
You cannot re-use an unfinished download queue or keep
the download history.

*******************************************
*** Changes since 0.4.9                 ***
*******************************************
- Fixed missing session keys in the skins
- Added compatibility option to disable the new security feature
- Added option to disable use of multi-core par (OSX and Windows)
- Replaced PAR2 for OSX
*******************************************
*** Changes since 0.4.8                 ***
*******************************************
- Important security fix, preventing "Cross-Site Request Forgery" vulnerability
  as reported by Secunia.
  - All self-references to SABnzbd require a session key (invisible for the user).
  - API requests now require an API-key (can be found in Config->General)
    This will influence scripts and third-party utilities.
- Fixed false unrar error messages when using Linux wth a non-UTF filesystem
- Fixed another potential par2 problem for OSX
*******************************************
*** Changes since 0.4.7                 ***
*******************************************
Fixed:
- Fixed various par2-repair problems for OSX
- Solved long queue display problem for OSX
- Fixed news-group and newzbin-category to SABnzbd-category conversion

*******************************************
*** Changes since 0.4.6                 ***
*******************************************
New:
- Support end-of-queue standby/shutdown for OSX
- Unix/OSX: Do not change permissions of existing folders
- Sort RSS previews newest-job-first
Fixed:
- Reduce character filtering in filenames to absolute minumum
- Do not remove ';' from foldernames
- After file-joining, the .1 files are sometimes not removed
- Scheduled or end-of-queue Hibernate and Standby sometimes crash.
- When trimming newzbin titles do not add unique number (defeats duplicate detection)
- Repaired accented character problems on OSX
- Show correct free space for very large disks on Windows


*******************************************
*** Changes since 0.4.5                 ***
*******************************************
New:
- "No duplicates" option
  (Do not download an NZB whose name is already present in the backup folder)
- Option to choose between transposing or removing illegal filename characters
- Restore the "auto-disconnect" option
- Keep Windows awake while downloading/post-processing
- Updated par2 and unrar for OSX
- Add option/parameters for ionice, off by default (Linux)
Fixed:
- Properly close server connections
  This should prevent servers from complaining about "too many connections" after
  pauses and empty queues
- Removed warning for correct, but empty RSS feeds
- Restore support for rar's with .nnn extensions
- Problem with deleting nameless files from queue
- Solved logging problem for OSX

*******************************************
*** Changes since 0.4.4                 ***
*******************************************
New:
- Allow override of the newzbin category in the RSS scanner
- No longer disable RSS schedule flag when changing filters
- Support RSS feeds from nzbindex.nl
- Support GZipped NZB files in RSS run (needed for some sites)
- Retry on incomplete NZB files in RSS run
- Use ionice (if present) to run external utilities (Linux)
- Current (scheduled) speed now shows in the speedbox
  Speedbox no longer updates the INI file

Fixed:
- Proper handling of accented characters
- Removed several Category handling problems
- Several TV episode handler improvements
- Refuse UNC paths in Windows for "incomplete" (due to par2)
- API-addid did not accept "cat" parameter
- IE and Opera could not delete first schedule
- Encrypted and obfusticated RAR files were deleted from the Watched folder
  instead of ignored.
- Hanging-unrar on Linux
- Retry malformed yEnc articles on other server(s)


*******************************************
*** Changes since 0.4.3                 ***
*******************************************
Fixed:
- RSS feeds not staying enabled through restart
- Jobs could sometimes fail when cleanup-list is used
- Rename similar files in TV sorting
- Un-openable RAR files would crash the dirscanner
- File-upload did not accept RARred NZB files
- Clearing the download speed shows an error
- Missing incomplete folder for a download causes par2 errors
- Filtering files on extension in the queue can lead to failed jobs
- Rename similar files in TV sorting
- Better error reporting for problems with external programs
- SMPL: Status does not always display Downloading when it should


*******************************************
*** Changes since 0.4.2                 ***
*******************************************
New:
- Watched folder and UI now accept RAR files containing NZB-files.
- Add API call to retrieve version
- Sort the category list
Fixed:
- Watched folder: changed files will now be re-examined
- Duplicate RSS jobs were not filtered out
- Delete history made safer
- Proper script was not set when fetching from newzbin bookmarks
- Strip white-space around server host name (preventing copy-paste errors)
- Par2 checking would fail if first article of a par2 file is missing
- No error report was giben when server authentication is missing
- On schedule change, evaluate pause/resume state properly
- Fixed %s.n bug in the TV Sorting Preview
- Fixed %s.n and %s_n bug in TV Sorting output


*******************************************
*** Major changes since 0.3.4           ***
*******************************************

- Secure NNTP (SSL)
- RSS is finally useful
- Better newzbin support
    - Download based on Bookmarks
    - Compatible with the new www.newzbin.com
- User-defined categories for precise storage and handling
- Intelligent handling of seasons of TV shows
- The Windows binary distribution now comes with a PAR2
  program that supports a multi-core CPU.
  You can tune the performance of PAR2 (Config->Switches)
- iPhone skin
- Optional secondary web-interface on http://host:port/sabnzbd/m
- Improved bandwidth control
- Highly improved Plush and Smpl skins
- General improvement of robustness and usability

==============================================================
