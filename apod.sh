#!/bin/bash
# cd ~/images/wallpapers
olddir=$HOME/Dropbox/Photos/wallpapers/apod
cd $olddir
curl -D- -o /dev/null -s http://www.google.com > /dev/null
if [[ $? == 0 ]]; then
  # get page
  curl -silent http://apod.nasa.gov/apod/astropix.html > urls.txt
  # get all image
  url=$(grep 'IMG SRC' urls.txt)

  url=$(echo ${url:10})
  url=$(echo "${url%?}")
  url2=$(echo "${url:11}")
  oldurl=`cat last.txt`

  if [[ "$url2" == "$oldurl" ]]; then
    rm -f urls.txt
    exit 0
  fi
  # download all images
  IMG_LINK=`echo "http://apod.nasa.gov/apod/"$url`
  wget -q $IMG_LINK
  notify-send 'Todays APOD picture downloaded' $url2
  echo ${url:11} > last.txt

  export DISPLAY=:0
  feh --bg-scale $url2
  # nitrogen --set-zoom-fill --save "$url2"
  # mv *.jpg auto
  # cp *.jpg auto
  # mv *.jpg $olddir
  # mv *.gif $olddir
  # cp *.gif auto
  cp $url2 auto
  # mv *.gif $olddir
  #clean
  rm -f urls.txt
  rm -f *.html
else
  notify-send 'APOD no internet'
fi
exit 0
