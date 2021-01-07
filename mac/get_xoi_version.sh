VERSION=$(cat xoi-version.json| jq -r '.version')
IFS='.' read -r -a SPLIT_VERSION <<< "$VERSION"
MAJOR="$((${SPLIT_VERSION[0]} * 1000000))"
MINOR="$((${SPLIT_VERSION[1]} * 1000))"
PATCH="${SPLIT_VERSION[2]}"
SEQUENCE="${MAJOR}${MINOR}${PATCH}"
echo $SEQUENCE
