const yup = require('yup');

const schema = yup.object().shape({
    name: yup
        .string()
        .required(),
    num: yup.number()
});

schema
    .isValid({name: 'd', num: "2"})
    .then(isValid => console.log(isValid));

schema.validate({name: 'd', num: "aaa"})
    .then((values) => console.log(values))
    .catch(errors => console.log(errors));