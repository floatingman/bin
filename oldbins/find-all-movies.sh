#!/bin/bash

# fill with more extensions or have it as a cmd line arg
TYPES=( mov mp4 avi wmv m4v )

DIR=$1

# Create a regex of the extensions for the find command
TYPES_RE="\\("${TYPES[1]}
for t in "${TYPES[@]:1:${#TYPES[*]}}"; do
  TYPES_RE="${TYPES_RE}\\|${t}"
done
TYPES_RE="${TYPES_RE}\\)"

# Set the field seperator to newline instead of spae
SAVEIFS=$IFS
IFS=$(echo -en "\n\b")

# Generate output from path and size using: `stat -c "%s" filepath`
OUTPUT=""
for f in `find ${DIR} -type f -regex ".*\.${TYPES_RE}"`; do
  SIZE=`stat -c "%s" ${f}`
  SIZEK=`echo "scale=2; ${SIZE} / 1024" | bc -l`
  SIZEM=`echo "scale=2; ${SIZEK} / 1024" | bc -l`
  OUTPUT=`echo ${SIZE}b / ${SIZEK}Kb / ${SIZEM}Mb - ${f}`";"$OUTPUT
done

$ Reset IFS
IFS=$SAVEIFS

$ Reverse numeric sort the output and replace ; with \n for printing
echo $OUTPUT | tr ';' '\n' | sort -nr
