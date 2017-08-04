const fs = require(`fs`);
const XmlStream = require(`xml-stream`);

/**
 * Class representing a classifier converter
 */
class TJSConverter {

    /**
     * Create a converter
     * @param {string} cascadeXmlPath - relative path to xml file
     */
    constructor(cascadeXmlPath) {
        this._cascadeXmlStream = fs.createReadStream(cascadeXmlPath);

        this._description = null;
        this._author = null;
        this._version = null;
        this._link = null;
        this._license = null;

    }

    /**
     * set jsdoc description
     * @param {string} description
     * @returns {TJSConverter}
     */
    setDescription(description) {
        this._description = description;
        return this;
    }

    /**
     * set jsdoc author
     * @param {string} author
     * @param {string} email
     * @returns {TJSConverter}
     */
    setAuthor(author, email = null) {
        this._author = `${author} ${((email) ? '<' + email + '>' : '')}`;
        return this;
    }

    /**
     * set jsdoc version
     * @param {string} version
     * @returns {TJSConverter}
     */
    setVersion(version) {
        this._version = version;
        return this;
    }

    /**
     * set jsdoc link
     * @param {string} link - URL
     * @returns {TJSConverter}
     */
    setLink(link) {
        this._link = link;
        return this;
    }

    /**
     * set jsdoc license
     * @param {string} license
     * @returns {TJSConverter}
     */
    setLicense(license) {
        this._license = license;
        return this;
    }

    /**
     * get defined jsdoc comment
     * @returns {string}
     */
    getDocblock() {
        let docblocks = [];

        // Write Description
        if (this._description) {
            docblocks.push(`* ${this._description}`);
        }

        // Write Author
        if (this._author) {
            docblocks.push(`* @author ${this._author}`);
        }

        // Write Version
        if (this._version) {
            docblocks.push(`* @version ${this._version}`);
        }

        // Write link
        if (this._link) {
            docblocks.push(`* @link ${this._link}`);
        }

        // Write license
        if (this._license) {
            docblocks.push(`* @license ${this._license}`);
        }

        return (docblocks.length)
            ? `/**
${docblocks.join(`\n`)}
*/\n`
            : ``;

    }

    /**
     * convert and saves classifier as tracking.js-ViolaJones js file
     * @param {string} classifier - tracking.ViolaJones.classifiers.${classifier}
     * @param {string} filepath - relative path for export
     * @returns {Promise}
     */
    saveAsVJ(classifier, filepath) {
        return new Promise((resolve, reject) => {

            this.convert()
                .then((converted) => {
                    let docblock = this.getDocblock();

                    let vjClassifierString = `${docblock}tracking.ViolaJones.classifiers.${classifier} = new Float64Array(${JSON.stringify(converted)});`;

                    fs.writeFile(filepath, vjClassifierString, (err) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(vjClassifierString);
                        }
                    });

                })
                .catch((err) => {
                    reject(err);
                });

        });
    }

    /**
     * converter to tracking.js VJ
     * @param {object} orig
     * @returns {Array}
     */
    toTjs(orig) {

        let results = [];
        let f = 0;

        // width and height
        results.push(orig.cascadeSize.width);
        results.push(orig.cascadeSize.height);

        // iterate through stages
        for (let i = 0, l = orig.nstages; i < l; i++) {
            // stageThreshold, nodeLength
            let stage = orig.stages[i++];

            results.push(stage.stageThreshold);
            results.push(stage.nodes.length);

            // iterate through nodes
            for (var j = 0; j < stage.nnodes;) {
                // tilted, rectsLength
                var node = stage.nodes[j++];
                var rect = orig.rects[f++];

                results.push(rect.tilted);
                results.push(rect.data.length);

                // iterate through rects
                for (var k = 0, N = rect.data.length; k < N;) {
                    // rectLeft, rectTop, rectWidth, rectHeight, rectWeight
                    var R = rect.data[k++].split(' ');
                    for (let l = 0, M = R.length; l < M; l++)
                        results.push(+R[l]);
                }

                results.push(node.threshold);
                results.push(node.left_val);
                results.push(node.right_val);
            }
        }

        return results;
    }

    /**
     * convert xml to classifier
     * @returns {Promise}
     */
    convert() {

        return new Promise((resolve, reject) => {

            let f = 0;
            let g = 0;

            let xml = new XmlStream(this._cascadeXmlStream);
            let haarStruct = {
                nstages: 0,
                stages: [],
                rects: [],
                maxWeakCount: 0,
                cascadeSize: {
                    width: 0,
                    height: 0
                },
                maxCatCount: 0
            };

            xml.collect(`_`);

            xml.on('endElement: size', (item) => {
                let sizes = item['$text'].split(' ');

                haarStruct.cascadeSize.width = +sizes[0];
                haarStruct.cascadeSize.height = +sizes[1];
            });

            xml.on('endElement: cascade > height', (item) => {
                haarStruct.cascadeSize.height = +item['$text'];
            });

            xml.on('endElement: cascade > width', (item) => {
                haarStruct.cascadeSize.width = +item['$text'];
            });

            xml.on('endElement: stages > _', (item) => {
                if (!item.trees) {
                    // dealing with the new type
                    let stage = {
                        stageThreshold: parseFloat(item.stageThreshold),
                        nodes: []
                    };

                    stage.nnodes = item.weakClassifiers['_'].length;

                    for (let i = 0; i < stage.nnodes; i++) {
                        let internalNodes = item
                            .weakClassifiers['_'][i]
                            .internalNodes.split(' ');
                        let leafValues = item
                            .weakClassifiers['_'][i]
                            .leafValues.split(' ');
                        let node = {
                            left_val: '',
                            right_val: '',
                            threshold: ''
                        };

                        g++;

                        node.left_val = parseFloat(leafValues[0]);
                        node.right_val = parseFloat(leafValues[1]);
                        node.f = +internalNodes[2];
                        node.threshold = parseFloat(internalNodes[3]);

                        stage.nodes.push(node);
                    }

                    haarStruct.nstages++;
                    haarStruct.stages.push(stage);
                } else {
                    // dealing with the old type
                    let trees = item.trees._;
                    let stage = {
                        stageThreshold: parseFloat(item.stage_threshold),
                        nodes: []
                    };

                    stage.nnodes = trees.length;

                    for (let i in trees) {
                        let tree = trees[i]._;
                        let node = {
                            "left_val": parseFloat(tree[0].left_val),
                            "right_val": parseFloat(tree[0].right_val),
                            "threshold": parseFloat(tree[0].threshold),
                            "f": f++
                        };

                        g++;
                        stage.nodes.push(node);

                        haarStruct.rects.push({
                            data: tree[0].feature.rects._,
                            tilted: +tree[0].feature.tilted
                        });
                    }

                    haarStruct.nstages++;
                    haarStruct.stages.push(stage);
                }
            });

            xml.on('endElement: features > _', (item) => {
                haarStruct.rects.push({
                    data: item.rects['_'],
                    tilted: item.tilted ? 1 : 0
                });

                f++;
            });

            xml.on('error', (err) => {
                reject(err);
            });

            xml.on('end', () => {
                if (g !== f) {
                    return reject(new Error('Number of rects does not mach number of Nodes'));
                }

                resolve(this.toTjs(haarStruct));
            });

        })

    }

}

module.exports = TJSConverter;