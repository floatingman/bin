#! /usr/bin/python

try:
	import commands, os, sys, string, getopt
except ImportError, msg1:
	exit(msg1)

def help_message():
    print '''This program joins split avi files. The file names of the split avi files to be joined should be in the manner:
	(filename1).avi.part1, (filename1).avi.part2,...
	or
	(filename1).avi.001, (filename1).avi.002,...
	The point is, the filenames are separated by '.' from their file (avi) type extension. The final combined video has the format (filename1)_final.avi.
	This program also assumes there are at least 2 split files you want to join in a single file. Otherwise, it will just copy the single avi file into (filename1)_final.avi.
	A MEncoder installation is required.
    Options:
	-h		displays this help message
	--file=		expects a file containing the list of avi files to be joined
	--version	displays Python version

       e.g. To join avi files in the current directory, listed in split_files.txt:
	 join_avi.py --file=split_files.txt'''
    sys.exit(0)

def getFilenames(split_list):
	file = open(split_list, "r")
	lines = file.readlines()
	try:
		i=True
		for filename in lines:
			namae = filename.split(".")
			if i == True:
				os.system("cat "+namae[0]+"* > _"+namae[0]+"_.avi")
				os.system("mencoder -forceidx -oac copy -ovc copy _"+ namae[0]+"_.avi -o _"+namae[0]+"_final.avi")
				os.system("rm _"+namae[0]+"_.avi")
				i = False
			if i == False:
				if os.system("ls "+namae[0]+"*"):
					i = False
				else:
					i = True
	except ValueError, msg:
		exit(msg)
	file.close()

def isempty(self) :
    return (len(self) == 0) 

try:
	options, xarguments = getopt.getopt(sys.argv[1:],'ha', ['file=','version'])
except getopt.error:
	print "Error: You tried to use an unknown option or the argument for an option that requires it was missing. Try `options.py -h' for more information."
	sys.exit(0)

if isempty(options):
	help_message()

for a in options[:]:
    if a[0] == '-h':
        help_message()

for a in options[:]:
	if a[0] == '--file' and a[1] != '':
		getFilenames(a[1])
		options.remove(a)
		break
	elif a[0] == '--file' and a[1] == '':
		print '--file expects an argument'
		sys.exit(0)

for a in options[:]:
    if a[0] == '--version':
        print 'join_avi.py version 0.5'
        sys.exit(0)
