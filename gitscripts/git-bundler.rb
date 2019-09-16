#!/usr/bin/env ruby
if __FILE__ == $0
  bundle_name = ARGV[0] if (ARGV[0])
  bundle_name = `pwd`.split('/').last.chomp if bundle_name.nil?
  bundle_name += ".git.bundle"
  puts "Backing up to bundle #{bundle_name}"
  `git bundle create ~/Dropbox/git-backups/#{bundle_name} --all`
end
## git-bundler.rb
## utility to backup git repositories in bundles under the git-backups directory
## made with code snatched from http://stackoverflow.com/questions/2129214/backup-a-local-git-repository
