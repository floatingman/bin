Synopsis
Here is a bunch of utilities I use and don't use because I'm too scared to get rid of them.
I put them in a directory in my path for easy access.

## Permissions

Scripts are made executable via a `run_` chezmoi script that runs on every `chezmoi apply`.
This causes chezmoi to detect permission changes and prompt to overwrite. Use `chezmoi apply --force`
or accept the prompt to proceed.
