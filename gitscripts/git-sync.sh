#!/bin/sh
#

# Local bare repository name
syncrepo=flashlinux
reporoot=~/Dropbox/git

# Display repository name only once
log_repo() {
  [ "x$lastrepo" == "x$repo" ] || {
    printf "\nREPO: ${repo}\n"
    lastrepo="$repo"
  }
}

# Log a message for a repository
log_msg() {
  log_repo
  printf "  $1\n"
}

# fast-forward reference $1 to $syncrepo/$1
fast_forward_ref() {
  log_msg "fast-forwarding ref $1"
  current_ref=$(cat .git/HEAD)
  if [ "x$current_ref" = "xref: refs/heads/$1" ]
  then
    # Check for dirty index
    files=$(git diff-index --name-only HEAD --)
    git merge refs/remotes/$syncrepo/$1
  else
    git branch -f $1 refs/remotes/$syncrepo/$1
  fi
}

# Push reference $1 to $syncrepo
push_ref() {
  log_msg "Pushing ref $1"
  if ! git push --tags $syncrepo $1
  then
    exit 1
  fi
}

# Check if a ref can be moved
#   - fast-forwards if behind the sync repo and is fast-forwardable
#   - Does nothing if ref is up to date
#   - Pushes ref to $syncrepo if ref is ahead of syncrepo and fastforwardable
#   - Fails if ref and $syncrop/ref have diverged
check_ref() {
  revlist1=$(git rev-list refs/remotes/$syncrepo/$1..$1)
  revlist2=$(git rev-list $1..refs/remotes/$syncrepo/$1)
  if [ "x$revlist1" = "x" -a "x$revlist2" = "x" ]
  then
    # Ref $1 is up to date.
    :
  elif [ "x$revlist1" = "x" ]
  then
    # Ref $1 is behind $syncrepo/$1 and can be fast-forwarded.
    fast_forward_ref $1 || exit 1
  elif [ "x$revlist2" = "x" ]
  then
    # Ref $1 is ahead of $syncrepo/$1 and can be pushed.
    push_ref $1 || exit 1
  else
    log_msg "Ref $1 and $syncrepo/$1 have diverged."
    exit 1
  fi
}

# Check all local refs with matching refs in the $syncrepo
check_refs () {
  git for-each-ref refs/heads/* | while read sha1 commit ref
  do
    ref=${ref/refs\/heads\//}
    git for-each-ref refs/remotes/$syncrepo/$ref | while read sha2 commit ref2
    do
      if [ "x$sha2" != "x" -a "x$sha2" != "x" ]
      then
        check_ref $ref || exit 1
      fi
    done
  done
}

# For all repositories under $reporoot
#   Check all refs matching $syncrepo and fast-forward, or push as necessary
#   to synchronize the ref with $syncrepo
#   Bail out if ref is not fastforwardable so user can fix and rerun
time {
  retval=0
  if find $reporoot -type d -name '*.git' | {
      while read repo
      do
        repo=${repo/\/.git/}
        cd ${repo}
        upd=$(git remote update $syncrepo 2>&1 || retval=1)
        [ "x$upd" = "xFetching $syncrepo" ] || {
          log_repo
          printf "$upd\n"
        }
        check_refs || retval=1
      done
      exit $retval
    }
  then
    printf "\nAll done.\n"
  else
    printf "\nFix and redo.\n"
  fi
}

exit $retval
