#!/bin/sh

ELECTRON_RUN_AS_NODE="1" \
	"$VSCODE_GIT_EDITOR_NODE" "$VSCODE_GIT_EDITOR_MAIN" $VSCODE_GIT_EDITOR_EXTRA_ARGS "$@"
