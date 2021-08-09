class LispError extends Error {

    constructor(message, stacktrace) {
        super(message)

        this.lispStacktrace = stacktrace
    }

}


export {LispError};