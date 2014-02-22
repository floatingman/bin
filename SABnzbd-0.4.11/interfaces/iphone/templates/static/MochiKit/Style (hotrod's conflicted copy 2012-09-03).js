--- !ruby/object:RI::ClassDescription 
attributes: []

class_methods: 
- !ruby/object:RI::MethodSummary 
  name: getwd
- !ruby/object:RI::MethodSummary 
  name: glob
- !ruby/object:RI::MethodSummary 
  name: new
comment: 
- !ruby/struct:SM::Flow::H 
  level: 2
  text: Pathname
- !ruby/struct:SM::Flow::P 
  body: "Pathname represents a pathname which locates a file in a filesystem. The pathname depends on OS: Unix, Windows, etc. Pathname library works with pathnames of local OS. However non-Unix pathnames are supported experimentally."
- !ruby/struct:SM::Flow::P 
  body: It does not represent the file itself. A Pathname can be relative or absolute. It's not until you try to reference the file that it even matters whether the file exists or not.
- !ruby/struct:SM::Flow::P 
  body: Pathname is immutable. It has no method for destructive update.
- !ruby/struct:SM::Flow::P 
  body: The value of this class is to manipulate file path information in a neater way than standard Ruby provides. The examples below demonstrate the difference. <b>All</b> functionality from File, FileTest, and some from Dir and FileUtils is included, in an unsurprising way. It is essentially a facade for all of these, and more.
- !ruby/struct:SM::Flow::H 
  level: 2
  text: Examples
- !ruby/struct:SM::Flow::H 
  level: 3
  text: "Example 1: Using Pathname"
- !ruby/struct:SM::Flow::VERB 
  body: "  require 'pathname'\n  p = Pathname.new(&quot;/usr/bin/ruby&quot;)\n  size = p.size              # 27662\n  isdir = p.directory?       # false\n  dir  = p.dirname           # Pathname:/usr/bin\n  base = p.basename          # Pathname:ruby\n  dir, base = p.split        # [Pathname:/usr/bin, Pathname:ruby]\n  data = p.read\n  p.open { |f| _ }\n  p.each_line { |line| _ }\n"
- !ruby/struct:SM::Flow::H 
  level: 3
  text: "Example 2: Using standard Ruby"
- !ruby/struct:SM::Flow::VERB 
  body: "  p = &quot;/usr/bin/ruby&quot;\n  size = File.size(p)        # 27662\n  isdir = File.directory?(p) # false\n  dir  = File.dirname(p)     # &quot;/usr/bin&quot;\n  base = File.basename(p)    # &quot;ruby&quot;\n  dir, base = File.split(p)  # [&quot;/usr/bin&quot;, &quot;ruby&quot;]\n  data = File.read(p)\n  File.open(p) { |f| _ }\n  File.foreach(p) { |line| _ }\n"
- !ruby/struct:SM::Flow::H 
  level: 3
  text: "Example 3: Special features"
- !ruby/struct:SM::Flow::VERB 
  body: "  p1 = Pathname.new(&quot;/usr/lib&quot;)   # Pathname:/usr/lib\n  p2 = p1 + &quot;ruby/1.8&quot;            # Pathname:/usr/lib/ruby/1.8\n  p3 = p1.parent                  # Pathname:/usr\n  p4 = p2.relative_path_from(p3)  # Pathname:lib/ruby/1.8\n  pwd = Pathname.pwd              # Pathname:/home/gavin\n  pwd.absolute?                   # true\n  p5 = Pathname.new &quot;.&quot;           # Pathname:.\n  p5 = p5 + &quot;music/../articles&quot;   # Pathname:music/../articles\n  p5.cleanpath                    # Pathname:articles\n  p5.realpath                     # Pathname:/home/gavin/articles\n  p5.children                     # [Pathname:/home/gavin/articles/linux, ...]\n"
- !ruby/struct:SM::Flow::H 
  level: 2
  text: Breakdown of functionality
- !ruby/struct:SM::Flow::H 
  level: 3
  text: Core methods
- !ruby/struct:SM::Flow::P 
  body: "These methods are effectively manipulating a String, because that's all a path is. Except for #mountpoint?, #children, and #realpath, they don't access the filesystem."
- !ruby/object:SM::Flow::LIST 
  contents: 
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: +
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#join"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#parent"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#root?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#absolute?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#relative?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#relative_path_from"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#each_filename"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#cleanpath"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#realpath"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#children"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#mountpoint?"
  type: :BULLET
- !ruby/struct:SM::Flow::H 
  level: 3
  text: File status predicate methods
- !ruby/struct:SM::Flow::P 
  body: "These methods are a facade for FileTest:"
- !ruby/object:SM::Flow::LIST 
  contents: 
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#blockdev?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#chardev?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#directory?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#executable?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#executable_real?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#exist?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#file?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#grpowned?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#owned?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#pipe?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#readable?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#world_readable?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#readable_real?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#setgid?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#setuid?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#size"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#size?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#socket?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#sticky?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#symlink?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#writable?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#world_writable?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#writable_real?"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#zero?"
  type: :BULLET
- !ruby/struct:SM::Flow::H 
  level: 3
  text: File property and manipulation methods
- !ruby/struct:SM::Flow::P 
  body: "These methods are a facade for File:"
- !ruby/object:SM::Flow::LIST 
  contents: 
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#atime"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#ctime"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#mtime"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#chmod(mode)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#lchmod(mode)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#chown(owner, group)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#lchown(owner, group)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#fnmatch(pattern, *args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#fnmatch?(pattern, *args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#ftype"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#make_link(old)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#open(*args, &amp;block)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#readlink"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#rename(to)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#stat"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#lstat"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#make_symlink(old)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#truncate(length)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#utime(atime, mtime)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#basename(*args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#dirname"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#extname"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#expand_path(*args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#split"
  type: :BULLET
- !ruby/struct:SM::Flow::H 
  level: 3
  text: Directory methods
- !ruby/struct:SM::Flow::P 
  body: "These methods are a facade for Dir:"
- !ruby/object:SM::Flow::LIST 
  contents: 
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: Pathname.glob(*args)
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: Pathname.getwd / Pathname.pwd
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#rmdir"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#entries"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#each_entry(&amp;block)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#mkdir(*args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#opendir(*args)"
  type: :BULLET
- !ruby/struct:SM::Flow::H 
  level: 3
  text: IO
- !ruby/struct:SM::Flow::P 
  body: "These methods are a facade for IO:"
- !ruby/object:SM::Flow::LIST 
  contents: 
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#each_line(*args, &amp;block)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#read(*args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#readlines(*args)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#sysopen(*args)"
  type: :BULLET
- !ruby/struct:SM::Flow::H 
  level: 3
  text: Utilities
- !ruby/struct:SM::Flow::P 
  body: "These methods are a mixture of Find, FileUtils, and others:"
- !ruby/object:SM::Flow::LIST 
  contents: 
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#find(&amp;block)"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#mkpath"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#rmtree"
  - !ruby/struct:SM::Flow::LI 
    label: "-"
    body: "#unlink / #delete"
  type: :BULLET
- !ruby/struct:SM::Flow::H 
  level: 2
  text: Method documentation
- !ruby/struct:SM::Flow::P 
  body: As the above section shows, most of the methods in Pathname are facades. The documentation for these methods generally just says, for instance, &quot;See FileTest.writable?&quot;, as you should be familiar with the original method anyway, and its documentation (e.g. through <tt>ri</tt>) will contain more information. In some cases, a brief description will follow.
constants: 
- !ruby/object:RI::Constant 
  comment: 
  name: SEPARATOR_PAT
  value: /[#{Regexp.quote File::ALT_SEPARATOR}#{Regexp.quote File::SEPARATOR}]/
- !ruby/object:RI::Constant 
  comment: 
  name: SEPARATOR_PAT
  value: /#{Regexp.quote File::SEPARATOR}/
full_name: Pathname
includes: []

instance_methods: 
- !ruby/object:RI::MethodSummary 
  name: +
- !ruby/object:RI::MethodSummary 
  name: <=>
- !ruby/object:RI::MethodSummary 
  name: ==
- !ruby/object:RI::MethodSummary 
  name: ===
- !ruby/object:RI::MethodSummary 
  name: TO_PATH
- !ruby/object:RI::MethodSummary 
  name: absolute?
- !ruby/object:RI::MethodSummary 
  name: add_trailing_separator
- !ruby/object:RI::MethodSummary 
  name: ascend
- !ruby/object:RI::MethodSummary 
  name: atime
- !ruby/object:RI::MethodSummary 
  name: basename
- !ruby/object:RI::MethodSummary 
  name: blockdev?
- !ruby/object:RI::MethodSummary 
  name: chardev?
- !ruby/object:RI::MethodSummary 
  name: chdir
- !ruby/object:RI::MethodSummary 
  name: children
- !ruby/object:RI::MethodSummary 
  name: chmod
- !ruby/object:RI::MethodSummary 
  name: chop_basename
- !ruby/object:RI::MethodSummary 
  name: chown
- !ruby/object:RI::MethodSummary 
  name: chroot
- !ruby/object:RI::MethodSummary 
  name: cleanpath
- !ruby/object:RI::MethodSummary 
  name: cleanpath_aggressive
- !ruby/object:RI::MethodSummary 
  name: cleanpath_conservative
- !ruby/object:RI::MethodSummary 
  name: ctime
- !ruby/object:RI::MethodSummary 
  name: del_trailing_separator
- !ruby/object:RI::MethodSummary 
  name: delete
- !ruby/object:RI::MethodSummary 
  name: descend
- !ruby/object:RI::MethodSummary 
  name: dir_foreach
- !ruby/object:RI::MethodSummary 
  name: directory?
- !ruby/object:RI::MethodSummary 
  name: dirname
- !ruby/object:RI::MethodSummary 
  name: each_entry
- !ruby/object:RI::MethodSummary 
  name: each_filename
- !ruby/object:RI::MethodSummary 
  name: each_line
- !ruby/object:RI::MethodSummary 
  name: entries
- !ruby/object:RI::MethodSummary 
  na  �E�����  ��  R�~��7�@����V 0	�Y�v�ϓ�	 ,J@K�	KI�u`����������� O`r� �lHBY \gRI}9���&�_'�D����O��e#�@S�(����R��nY5Ơ#��������F+��	X��1����I(��nz95�	�$-�I}�AA����ʓ�Ĕ��F�m����!��Y�2&��K/�(�~wl�E Dt�_== <���(�� ���`���T�Ac0<5\�a�e�� �)��,�VKɭ��Kq�aH ��m�=�����^��n@lqa�2),��&JDg�hD$11�Fro�J�x��04����v= �N|���1A�U+��A)# �k��J�Mc#8B]� 1�i(=@��rP��0%�Ӑ��fg�%���{V,5@x��jAI��O�%kO~$�/��8��R��؉I�+  2V��&�x�ܒ�H�#���%9�p	h�0B	#HD2#���B�`�a%g