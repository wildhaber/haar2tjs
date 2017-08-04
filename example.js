const TJSConverter = require(`./index`);

const input = `./examples/eye.classifier.xml`;
const output = `./examples/eye.classifier.js`;

const eyeToTjs = new TJSConverter(input);

eyeToTjs
    // Optional definition for Docblock-Comments
    .setDescription(`Example VJ Classifier for eyes`)
    .setAuthor(`Eduardo Lundgren`, `edu@rdo.io`)
    .setVersion(`v1.0.0`)
    .setLink(`https://trackingjs.com`)
    .setLicense(`BSD`)

    // Save as Viola Jones classifier
    .saveAsVJ(`eye`, output)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(`Ooops, an error happens...`);
        console.log(err);
    });