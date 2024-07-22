svetch.ts
=================

End-to-End typesafe fetch client for your API


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/svetch.ts.svg)](https://npmjs.org/package/svetch.ts)
[![Downloads/week](https://img.shields.io/npm/dw/svetch.ts.svg)](https://npmjs.org/package/svetch.ts)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g svetch.ts
$ svetch COMMAND
running command...
$ svetch (--version)
svetch.ts/0.0.0 linux-x64 node-v20.12.2
$ svetch --help [COMMAND]
USAGE
  $ svetch COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`svetch hello PERSON`](#svetch-hello-person)
* [`svetch hello world`](#svetch-hello-world)
* [`svetch help [COMMAND]`](#svetch-help-command)
* [`svetch plugins`](#svetch-plugins)
* [`svetch plugins add PLUGIN`](#svetch-plugins-add-plugin)
* [`svetch plugins:inspect PLUGIN...`](#svetch-pluginsinspect-plugin)
* [`svetch plugins install PLUGIN`](#svetch-plugins-install-plugin)
* [`svetch plugins link PATH`](#svetch-plugins-link-path)
* [`svetch plugins remove [PLUGIN]`](#svetch-plugins-remove-plugin)
* [`svetch plugins reset`](#svetch-plugins-reset)
* [`svetch plugins uninstall [PLUGIN]`](#svetch-plugins-uninstall-plugin)
* [`svetch plugins unlink [PLUGIN]`](#svetch-plugins-unlink-plugin)
* [`svetch plugins update`](#svetch-plugins-update)

## `svetch hello PERSON`

Say hello

```
USAGE
  $ svetch hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ svetch hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/Bewinxed/svetch.ts/blob/v0.0.0/src/commands/hello/index.ts)_

## `svetch hello world`

Say hello world

```
USAGE
  $ svetch hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ svetch hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/Bewinxed/svetch.ts/blob/v0.0.0/src/commands/hello/world.ts)_

## `svetch help [COMMAND]`

Display help for svetch.

```
USAGE
  $ svetch help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for svetch.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.6/src/commands/help.ts)_

## `svetch plugins`

List installed plugins.

```
USAGE
  $ svetch plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ svetch plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/index.ts)_

## `svetch plugins add PLUGIN`

Installs a plugin into svetch.

```
USAGE
  $ svetch plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into svetch.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SVETCH_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SVETCH_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ svetch plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ svetch plugins add myplugin

  Install a plugin from a github url.

    $ svetch plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ svetch plugins add someuser/someplugin
```

## `svetch plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ svetch plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ svetch plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/inspect.ts)_

## `svetch plugins install PLUGIN`

Installs a plugin into svetch.

```
USAGE
  $ svetch plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into svetch.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SVETCH_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SVETCH_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ svetch plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ svetch plugins install myplugin

  Install a plugin from a github url.

    $ svetch plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ svetch plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/install.ts)_

## `svetch plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ svetch plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ svetch plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/link.ts)_

## `svetch plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ svetch plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ svetch plugins unlink
  $ svetch plugins remove

EXAMPLES
  $ svetch plugins remove myplugin
```

## `svetch plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ svetch plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/reset.ts)_

## `svetch plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ svetch plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ svetch plugins unlink
  $ svetch plugins remove

EXAMPLES
  $ svetch plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/uninstall.ts)_

## `svetch plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ svetch plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ svetch plugins unlink
  $ svetch plugins remove

EXAMPLES
  $ svetch plugins unlink myplugin
```

## `svetch plugins update`

Update installed plugins.

```
USAGE
  $ svetch plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.8/src/commands/plugins/update.ts)_
<!-- commandsstop -->
