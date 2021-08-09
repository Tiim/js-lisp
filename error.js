class LispError extends Error {

    constructor(message, stacktrace) {
        super(message)

        this.lispStacktrace = stacktrace
    }

}

class ParseError extends Error {
    constructor(message, pos) {
        super(message);
        this.pos = pos;
    }
}


export {LispError, ParseError};