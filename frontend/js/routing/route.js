export class Route {
    constructor(dest, contentPath) {
        this.dest = dest;
        this.contentPath = contentPath;
    }

    load(params) { }

    onClose() { }
}