const TJSConverter = require(`./tjs.converter`);

const input = `./examples/eye.classifier.xml`;
const output = `./examples/eye.classifier.js`;

const eyeToTjs = new TJSConverter(input);

eyeToTjs
    .setDescription(`Example VJ Classifier for eyes`)
    .setAuthor(`Eduardo Lundgren`, `edu@rdo.io`)
    .setVersion(`v1.0.0`)
    .setLink(`https://trackingjs.com`)
    .setLicense(`BSD`)
    .saveAsVJ(`eye`, output)
    .then((result) => {
        console.log(result);
    });