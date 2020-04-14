import {LocaleObject, setLocale} from 'yup';

const ptBR: LocaleObject = {
    mixed: {
        required: '${path} é requerido'
    },
    string: {
        max: '${path} fulano precisa ter no máximo ${max} caracteres'
    },
    number: {
        min: '${path} precisa ser no minomo ${min}'
    }
}

setLocale(ptBR);

export * from 'yup';