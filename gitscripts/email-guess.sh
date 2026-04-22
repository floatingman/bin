#!/bin/bash
remote="$(git remote -v | awk '/\(push\)$/ {print $2}')"
email=dwnewman78@gmail.com # default
echo "$remote"
[[ $remote == *rancher* ]] && email=daniel.newman@suse.com
[[ $remote == *github.com:floatingman* ]] && email=dan@danlovesprogramming.com

echo "Configuring user.email as $email"
git config user.email $email
