let ExtractTextPlugin = require('extract-text-webpack-plugin');
let { omit } = require('lodash');

class Vue {
    /**
     * Required dependencies for the component.
     */
    dependencies() {
        let deps = [];

        if (Config.extractVueStyles && this.isSassGlobalVueStyle()) {
            deps.push('sass-resources-loader'); // Required for importing global styles into every component.
        }

        if (Config.vue.i18n) {
            deps.push('@kazupon/vue-i18n-loader');

            if (Config.vue.i18n === 'yaml') {
                deps.push('yaml-loader');
            }
        }

        return deps;
    }

    /**
     * Override the generated webpack configuration.
     *
     * @param {Object} webpackConfig
     */
    webpackConfig(config) {
        let { vueLoaderOptions, extractPlugin } = this.vueLoaderOptions();

        config.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader',
            exclude: /bower_components/,
            options: vueLoaderOptions
        });

        config.plugins.push(extractPlugin);

        if (this.isStylusGlobalVueStyle()) {
            config.plugins.push(new (require('webpack')).LoaderOptionsPlugin({
                options: { stylus: { import: [this.getGlobalVueStylePath()] } }
            }));
        }
    }

    /**
     * vue-loader-specific options.
     */
    vueLoaderOptions() {
        let extractPlugin = this.extractPlugin();

        if (Config.extractVueStyles) {
            var sassLoader = extractPlugin.extract({
                use: 'css-loader!sass-loader?indentedSyntax',
                fallback: 'vue-style-loader'
            });

            var scssLoader = extractPlugin.extract({
                use: 'css-loader!sass-loader',
                fallback: 'vue-style-loader'
            });

            if (this.isSassGlobalVueStyle()) {
                scssLoader.push({
                    loader: 'sass-resources-loader',
                    options: {
                        resources: this.getGlobalVueStylePath(),
                    }
                });

                sassLoader.push({
                    loader: 'sass-resources-loader',
                    options: {
                        resources: this.getGlobalVueStylePath(),
                    }
                });
            }
        }

        let vueLoaderOptions = Object.assign(
            {
                loaders: Object.assign(Config.extractVueStyles
                    ? {
                          js: {
                              loader: 'babel-loader',
                              options: Config.babel()
                          },

                          scss: scssLoader,

                          sass: sassLoader,

                          css: extractPlugin.extract({
                              use: 'css-loader',
                              fallback: 'vue-style-loader'
                          }),

                          stylus: extractPlugin.extract({
                              use:
                                  'css-loader!stylus-loader?paths[]=node_modules',
                              fallback: 'vue-style-loader'
                          }),

                          less: extractPlugin.extract({
                              use: 'css-loader!less-loader',
                              fallback: 'vue-style-loader'
                          })
                      }
                    : {
                          js: {
                              loader: 'babel-loader',
                              options: Config.babel()
                          }
                      }, Config.vue.loaders),
                postcss: Config.postCss
            },
            omit(Config.vue, ['i18n', 'loaders'])
        );

        if (Config.vue.i18n) {
            vueLoaderOptions.loaders.i18n = '@kazupon/vue-i18n-loader';

            if (Config.vue.i18n === 'yaml') {
                vueLoaderOptions.preLoaders.i18n = 'yaml-loader';
            }
        }

        return { vueLoaderOptions, extractPlugin };
    }

    extractPlugin() {
        if (typeof Config.extractVueStyles === 'string') {
            return new ExtractTextPlugin(this.extractFilePath());
        }

        let preprocessorName = Object.keys(Mix.components.all())
            .reverse()
            .find(componentName => {
                return ['sass', 'less', 'stylus', 'postCss'].includes(
                    componentName
                );
            });

        if (!preprocessorName) {
            return new ExtractTextPlugin(this.extractFilePath());
        }

        return Mix.components.get(preprocessorName).extractPlugins.slice(-1)[0];
    }

    extractFilePath() {
        let fileName =
            typeof Config.extractVueStyles === 'string'
                ? Config.extractVueStyles
                : 'vue-styles.css';

        return fileName.replace(Config.publicPath, '').replace(/^\//, '');
    }

    getGlobalVueStylePath() {
        return Mix.paths.root(Config.globalVueStyles);
    }

    isSassGlobalVueStyle() {
        return Config.globalVueStyles
            && Config.globalVueStyles.search(/\.s(a|c)ss$/) !== -1;
    }

    isStylusGlobalVueStyle() {
        return Config.globalVueStyles
            && Config.globalVueStyles.endsWith('.styl');
    }
}

module.exports = Vue;
