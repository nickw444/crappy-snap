const FLASH_MESSAGES = [
  'Cheese!',
  'Fabulous!',
  'Gorgeous!',
  'Wow!',
  'Fantastic!',
  'Awesome!',
  'Impressive!'
];

async function initPreview() {

}

function main() {
  const httpClient = new HttpClient();
  const snapService = new SnapHttpClient(httpClient);
  const view = new SnapView(document.getElementById('app'));
  const presenter = new SnapPresenter({snapService },view);
  presenter.start();
}

document.addEventListener('DOMContentLoaded', main);

class HttpClient {
  get(path) {
    return fetch(path);
  }

  post(path) {
    return fetch(path, {
      method: 'POST',
    })
  }
}

class SnapHttpClient {
  /**
   * @param {!HttpClient} httpClient
   */
  constructor(httpClient) {
    /**
     * @private
     * @const
     * @type {!HttpClient}
     */
    this.httpClient = httpClient;
  }

  capture() {
    return this.httpClient.get('/capture');
  }

  delete(filename) {
    return this.httpClient.post(`/delete?filename=${filename}`);
  }
}

class SnapView {
  /**
   *
   * @param {!HTMLElement} el
   */
  constructor(el) {
    /**
     * @private
     * @const
     * @type {!HTMLElement}
     */
    this.el = el;

    /**
     * @private
     * @const
     * @type {!Map<string, Function>}
     */
    this.handlers = new Map();

    this.el.querySelector('#snap-button').addEventListener('click', this.onSnapClick);
  }

  trigger(event, ...opts) {
    const handler = this.handlers.get(event);
    handler && handler(...opts);
  }

  on(event, cb) {
    this.handlers.set(event, cb);
  }

  onSnapClick() {

  }

  onDeleteClick() {

  }

  toggleFlash(visible) {

  }

  setFlashMessage(message) {

  }

  toggleCountdown(visible) {

  }

  setCountdownNumber(num) {

  }

  getPreviewStream() {
    return navigator.mediaDevices.getUserMedia({video: true});
  }

  setPreviewSrc(stream) {
    const previewEl = this.el.querySelector("#preview");
    previewEl.srcObject = stream;
    previewEl.onloadedmetadata = () => {
      previewEl.play();
    };
  }

  toggleControls() {

  }
}

/**
 * @enum {string}
 */
SnapView.Event = {
  SNAP: 'SNAP',
  DELETE: 'DELETE',
  GO_BACK: 'GO_BACK',
};

class SnapPresenter {
  /**
   * @param {{ snapService: SnapHttpClient }} opts
   * @param {!SnapView} view
   */
  constructor(opts, view) {
    /**
     * @private
     * @const
     * @type {!SnapView}
     */
    this.view = view;

    /**
     * @private
     * @const
     * @type {!SnapHttpClient}
     */
    this.snapService = opts.snapService;

    this.view.on(SnapView.Event.SNAP, () => this.onSnap());
    this.view.on(SnapView.Event.DELETE, () => this.onDelete());
    this.view.on(SnapView.Event.GO_BACK, () => this.onGoBack());
  }

  async start() {
    const stream = await this.view.getPreviewStream();
    this.view.setPreviewSrc(stream);
  }

  onGoBack() {

  }

  onDelete() {

  }

  onSnap() {

  }
}
