let argv = require('yargs').argv;
let fs = require('fs');

let mixfile = argv.env && argv.env.mixfile ? argv.env.mixfile : 'webpack.mix';
if (mixfile.endsWith('.js')) {
    mixfile = mixfile.substr(0, mixfile.length - 3);
}

class Paths {
    /**
     * Create a new Paths instance.
     */
    constructor() {
        const cwd = process.cwd();

        if (fs.existsSync(path.join(cwd, `${mixfile}.js`))) {
            this.rootPath = cwd;
        } else if (argv['$0'].includes('ava')) {
            this.rootPath = path.resolve(__dirname, '../');
        } else {
            this.rootPath = path.resolve(__dirname, '../../../');
        }
    }

    /**
     * Set the root path to resolve webpack.mix.js.
     *
     * @param {string} path
     */
    setRootPath(path) {
        this.rootPath = path;

        return this;
    }

    /**
     * Determine the path to the user's webpack.mix.js file.
     */
    mix() {
        return this.root(mixfile);
    }

    /**
     * Determine the project root.
     *
     * @param {string|null} append
     */
    root(append = '') {
        return path.resolve(this.rootPath, append);
    }
}

module.exports = Paths;
