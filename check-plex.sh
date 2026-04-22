#!/bin/bash

# Function to check the health of the plex container
check_plex_health() {
  # Get the last 10 lines of log output from the container named plex
  plex_logs=$(journalctl -n 10 -u plexmediaserver.service)

  # Count the number of times the "Sqlite3: Sleeping for 200ms to retry busy DB" line appears in the logs
  count=$(grep -c "Sqlite3: Sleeping for 200ms to retry busy DB" <<< "$plex_logs")

  # If the line appears more than 3 times, return a non-zero exit code to indicate a failure
  if [ "$count" -gt 3 ]; then
    echo "Oh no, I guess we have to restart the container."
    return 1
  fi

  # Otherwise, return a success exit code and print a message to the terminal
  echo "Plex seems to be okay! I just checked!"
  return 0
}

# Run the health check function continuously
while true; do
  check_plex_health
  # If the health check fails, restart the plex container
  if [ $? -ne 0 ]; then
    sudo systemctl restart plexmediaserver.service
  fi
  # Sleep for 3 minutes between each health check
  sleep 60
done
