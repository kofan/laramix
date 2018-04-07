const path = require('path');

class Clean {
    /**
     * The API name for the component.
     */
    name() {
        return ['clean'];
    }

    /**
     * Required dependencies for the component.
     */
    dependencies() {
        return ['clean-webpack-plugin'];
    }

    /**
     * Register the component.
     *
     * @param {Object} config
     */
    register(paths, config) {
        if (!config && typeof(paths) === 'object') {
            config = paths;
            paths = undefined;
        }

        this.paths = paths;
        this.config = config = config || {};

        if (!config.exclude) {
            config.exclude = [];
        }
        if (!config.root) {
            config.root = Mix.paths.root();
        }
    }

    /**
     * Webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        let CleanPlugin = require('clean-webpack-plugin');
        let config = this.config;
        let paths = this.paths;

        if (!paths) {
          paths = [path.resolve(Config.publicPath)];
          config.exclude.push('.gitignore', '.gitkeep', 'hot');
        }

        return new CleanPlugin(paths, config);
    }
}

module.exports = Clean;
