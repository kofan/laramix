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
    register(config) {
        this.config = config || {};

        if (!this.config.exclude) {
            this.config.exclude = [];
        }

        this.config.exclude.push('.git*', 'hot');
    }

    /**
     * Webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        let CleanPlugin = require('clean-webpack-plugin');

        return new CleanPlugin([Config.publicPath], this.config());
    }
}

module.exports = Clean;
