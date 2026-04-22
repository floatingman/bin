#!/bin/bash
i3-save-tree --workspace N > ~/.i3/workspace_N.json
tail n +2 ~/.i3/workspace_N.json | fgrep -v '// splitv' | sed 's|//||g' > ~/.i3/workspace_N.json

