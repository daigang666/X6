import { Basecoat } from '../common'
import { NumberExt, Dom } from '../util'
import { Point, Rectangle } from '../geometry'
import { KeyValue, ModifierKey } from '../types'
import { Cell } from '../model/cell'
import { Node } from '../model/node'
import { Edge } from '../model/edge'
import { Model } from '../model/model'
import { Collection } from '../model/collection'
import { CellView } from '../view/cell'
import { NodeView } from '../view/node'
import { HTML } from '../shape/standard/html'
import { Scroller as ScrollerWidget } from '../addon/scroller'
import { Base } from './base'
import { GraphView } from './view'
import { EventArgs } from './events'
import { Decorator } from './decorator'
import { Hook as HookManager } from './hook'
import { Options as GraphOptions } from './options'
import { DefsManager as Defs } from './defs'
import { GridManager as Grid } from './grid'
import { CoordManager as Coord } from './coord'
import { Keyboard as Shortcut } from './keyboard'
import { PrintManager as Print } from './print'
import { MouseWheel as Wheel } from './mousewheel'
import { FormatManager as Format } from './format'
import { Renderer as ViewRenderer } from './renderer'
import { HistoryManager as History } from './history'
import { MiniMapManager as MiniMap } from './minimap'
import { SnaplineManager as Snapline } from './snapline'
import { ScrollerManager as Scroller } from './scroller'
import { SelectionManager as Selection } from './selection'
import { HighlightManager as Highlight } from './highlight'
import { TransformManager as Transform } from './transform'
import { ClipboardManager as Clipboard } from './clipboard'
import { BackgroundManager as Background } from './background'
import {
  NodeTool,
  EdgeTool,
  PortLayout,
  PortLabelLayout,
  Attr as AttrDefinition,
  Grid as GridDefinition,
  Filter as FilterDefinition,
  Background as BackgroundDefinition,
  Highlighter as HighlightDefinition,
} from '../definition'
import {
  Router,
  Connector,
  ConnectionPoint,
  ConnectionStrategy,
  NodeConnectionAnchor,
  EdgeConnectionAnchor,
} from '../connection'

export class Graph extends Basecoat<EventArgs> {
  public readonly options: GraphOptions.Definition
  public readonly model: Model
  public readonly view: GraphView
  public readonly hook: HookManager
  public readonly grid: Grid
  public readonly defs: Defs
  public readonly coord: Coord
  public readonly renderer: ViewRenderer
  public readonly snapline: Snapline
  public readonly highlight: Highlight
  public readonly transform: Transform
  public readonly clipboard: Clipboard
  public readonly selection: Selection
  public readonly background: Background
  public readonly history: History
  public readonly scroller: Scroller
  public readonly minimap: MiniMap
  public readonly keyboard: Shortcut
  public readonly mousewheel: Wheel
  public readonly print: Print
  public readonly format: Format

  public get container() {
    return this.view.container
  }

  constructor(options: Partial<GraphOptions.Manual>) {
    super()

    this.options = GraphOptions.merge(options)
    this.hook = new HookManager(this)
    this.view = this.hook.createView()
    this.defs = this.hook.createDefsManager()
    this.coord = this.hook.createCoordManager()
    this.transform = this.hook.createTransformManager()
    this.highlight = this.hook.createHighlightManager()
    this.grid = this.hook.createGridManager()
    this.background = this.hook.createBackgroundManager()
    this.model = this.hook.createModel()
    this.renderer = this.hook.createRenderer()
    this.clipboard = this.hook.createClipboardManager()
    this.snapline = this.hook.createSnaplineManager()
    this.selection = this.hook.createSelectionManager()
    this.history = this.hook.createHistoryManager()
    this.scroller = this.hook.createScrollerManager()
    this.minimap = this.hook.createMiniMapManager()
    this.keyboard = this.hook.createKeyboard()
    this.mousewheel = this.hook.createMouseWheel()
    this.print = this.hook.createPrintManager()
    this.format = this.hook.createFormatManager()

    this.setup()
  }

  protected setup() {
    this.model.on('sorted', () => this.trigger('model:sorted'))
    this.model.on('reseted', (args) => this.trigger('model:reseted', args))
    this.model.on('updated', (args) => this.trigger('model:updated', args))
  }

  // #region model

  resetModel(cells: Cell[], options: Collection.SetOptions = {}) {
    this.model.resetCells(cells, options)
    return this
  }

  clearModel(options: Cell.SetOptions = {}) {
    this.model.clear(options)
    return this
  }

  toJSON() {
    return this.model.toJSON()
  }

  parseJSON(data: Model.FromJSONData) {
    return this.model.parseJSON(data)
  }

  fromJSON(data: Model.FromJSONData, options: Model.FromJSONOptions = {}) {
    this.model.fromJSON(data, options)
    return this
  }

  getCellById(id: string) {
    return this.model.getCell(id)
  }

  addNode(metadata: Node.Metadata, options?: Model.AddOptions): Node
  addNode(node: Node, options?: Model.AddOptions): Node
  addNode(node: Node | Node.Metadata, options: Model.AddOptions = {}): Node {
    return this.model.addNode(node, options)
  }

  createNode(metadata: Node.Metadata) {
    return this.model.createNode(metadata)
  }

  addEdge(metadata: Edge.Metadata, options?: Model.AddOptions): Edge
  addEdge(edge: Edge, options?: Model.AddOptions): Edge
  addEdge(edge: Edge | Edge.Metadata, options: Model.AddOptions = {}): Edge {
    return this.model.addEdge(edge, options)
  }

  createEdge(metadata: Edge.Metadata) {
    return this.model.createEdge(metadata)
  }

  addCell(cell: Cell | Cell[], options: Model.AddOptions = {}) {
    this.model.addCell(cell, options)
    return this
  }

  removeCell(cellId: string, options?: Collection.RemoveOptions): Cell | null
  removeCell(cell: Cell, options?: Collection.RemoveOptions): Cell | null
  removeCell(cell: Cell | string, options: Collection.RemoveOptions = {}) {
    return this.model.removeCell(cell as Cell, options)
  }

  removeCells(cells: (Cell | string)[], options: Cell.RemoveOptions = {}) {
    return this.model.removeCells(cells, options)
  }

  removeConnectedEdges(cell: Cell | string, options: Cell.RemoveOptions = {}) {
    return this.model.removeConnectedEdges(cell, options)
  }

  disconnectEdges(cell: Cell | string, options: Edge.SetOptions) {
    this.model.disconnectEdges(cell, options)
    return this
  }

  hasCell(id: string): boolean
  hasCell(cell: Cell): boolean
  hasCell(cell: string | Cell): boolean {
    return this.model.has(cell as Cell)
  }

  getCell<T extends Cell = Cell>(id: string) {
    return this.model.getCell<T>(id)
  }

  getCells() {
    return this.model.getCells()
  }

  getCellCount() {
    return this.model.total()
  }

  /**
   * Returns all the nodes in the graph.
   */
  getNodes() {
    return this.model.getNodes()
  }

  /**
   * Returns all the edges in the graph.
   */
  getEdges() {
    return this.model.getEdges()
  }

  /**
   * Returns all outgoing edges for the node.
   */
  getOutgoingEdges(cell: Cell | string) {
    return this.model.getOutgoingEdges(cell)
  }

  /**
   * Returns all incoming edges for the node.
   */
  getIncomingEdges(cell: Cell | string) {
    return this.model.getIncomingEdges(cell)
  }

  /**
   * Returns edges connected with cell.
   */
  getConnectedEdges(
    cell: Cell | string,
    options: Model.GetConnectedEdgesOptions = {},
  ) {
    return this.model.getConnectedEdges(cell, options)
  }

  /**
   * Returns an array of all the roots of the graph.
   */
  getRootCells() {
    return this.model.getRoots()
  }

  /**
   * Returns an array of all the leafs of the graph.
   */
  getLeafCells() {
    return this.model.getLeafs()
  }

  /**
   * Returns `true` if the node is a root node, i.e.
   * there is no  edges coming to the node.
   */
  isOriginCell(cell: Cell | string) {
    return this.model.isOrigin(cell)
  }

  /**
   * Returns `true` if the node is a leaf node, i.e.
   * there is no edges going out from the node.
   */
  isLeafCell(cell: Cell | string) {
    return this.model.isLeaf(cell)
  }

  /**
   * Returns all the neighbors of node in the graph. Neighbors are all
   * the nodes connected to node via either incoming or outgoing edge.
   */
  getNeighbors(cell: Cell, options: Model.GetNeighborsOptions = {}) {
    return this.model.getNeighbors(cell, options)
  }

  /**
   * Returns `true` if `cell2` is a neighbor of `cell1`.
   */
  isNeighbor(
    cell1: Cell,
    cell2: Cell,
    options: Model.GetNeighborsOptions = {},
  ) {
    return this.model.isNeighbor(cell1, cell2, options)
  }

  getSuccessors(cell: Cell, options: Cell.GetDescendantsOptions) {
    return this.model.getSuccessors(cell, options)
  }

  /**
   * Returns `true` if `cell2` is a successor of `cell1`.
   */
  isSuccessor(cell1: Cell, cell2: Cell) {
    return this.model.isSuccessor(cell1, cell2)
  }

  getPredecessors(cell: Cell, options: Cell.GetDescendantsOptions) {
    return this.model.getPredecessors(cell, options)
  }

  /**
   * Returns `true` if `cell2` is a predecessor of `cell1`.
   */
  isPredecessor(cell1: Cell, cell2: Cell) {
    return this.model.isPredecessor(cell1, cell2)
  }

  getCommonAncestor(...cells: (Cell | null | undefined)[]) {
    return this.model.getCommonAncestor(...cells)
  }

  /**
   * Returns an array of cells that result from finding nodes/edges that
   * are connected to any of the cells in the cells array. This function
   * loops over cells and if the current cell is a edge, it collects its
   * source/target nodes; if it is an node, it collects its incoming and
   * outgoing edges if both the edge terminal (source/target) are in the
   * cells array.
   */
  getSubGraph(cells: Cell[], options: Model.GetSubgraphOptions = {}) {
    return this.model.getSubGraph(cells, options)
  }

  /**
   * Clones the whole subgraph (including all the connected links whose
   * source/target is in the subgraph). If `options.deep` is `true`, also
   * take into account all the embedded cells of all the subgraph cells.
   *
   * Returns a map of the form: { [original cell ID]: [clone] }.
   */
  cloneSubGraph(cells: Cell[], options: Model.GetSubgraphOptions = {}) {
    return this.model.cloneSubGraph(cells, options)
  }

  cloneCells(cells: Cell[]) {
    return this.model.cloneCells(cells)
  }

  /**
   * Returns an array of nodes whose bounding box contains point.
   * Note that there can be more then one node as nodes might overlap.
   */
  getNodesFromPoint(x: number, y: number): Node[]
  getNodesFromPoint(p: Point.PointLike): Node[]
  getNodesFromPoint(x: number | Point.PointLike, y?: number) {
    return this.getNodesFromPoint(x as number, y as number)
  }

  /**
   * Returns an array of nodes whose bounding box top/left coordinate
   * falls into the rectangle.
   */
  getNodesInArea(
    x: number,
    y: number,
    w: number,
    h: number,
    options?: Model.GetCellsInAreaOptions,
  ): Node[]
  getNodesInArea(
    rect: Rectangle.RectangleLike,
    options?: Model.GetCellsInAreaOptions,
  ): Node[]
  getNodesInArea(
    x: number | Rectangle.RectangleLike,
    y?: number | Model.GetCellsInAreaOptions,
    w?: number,
    h?: number,
    options?: Model.GetCellsInAreaOptions,
  ): Node[] {
    return this.model.getNodesInArea(
      x as number,
      y as number,
      w as number,
      h as number,
      options,
    )
  }

  getNodesUnderNode(
    node: Node,
    options: {
      by?: 'bbox' | Rectangle.KeyPoint
    } = {},
  ) {
    return this.model.getNodesUnderNode(node, options)
  }

  searchCell(
    cell: Cell,
    iterator: Model.SearchIterator,
    options: Model.SearchOptions = {},
  ) {
    this.model.search(cell, iterator, options)
    return this
  }

  /***
   * Returns an array of IDs of nodes on the shortest
   * path between source and target.
   */
  getShortestPath(
    source: Cell | string,
    target: Cell | string,
    options: Model.GetShortestPathOptions = {},
  ) {
    return this.model.getShortestPath(source, target, options)
  }

  /**
   * Returns the bounding box that surrounds all cells in the graph.
   */
  getAllCellsBBox() {
    return this.model.getAllCellsBBox()
  }

  /**
   * Returns the bounding box that surrounds all the given cells.
   */
  getCellsBBox(cells: Cell[], options: Cell.GetCellsBBoxOptions = {}) {
    return this.model.getCellsBBox(cells, options)
  }

  startBatch(name: string | Model.BatchName, data: KeyValue = {}) {
    this.model.startBatch(name as Model.BatchName, data)
  }

  stopBatch(name: string | Model.BatchName, data: KeyValue = {}) {
    this.model.stopBatch(name as Model.BatchName, data)
  }

  batchUpdate<T>(
    name: string | Model.BatchName,
    execute: () => T,
    data?: KeyValue,
  ): T {
    this.startBatch(name, data)
    const result = execute()
    this.stopBatch(name, data)
    return result
  }

  //#endregion

  // #region cell

  isNode(cell: Cell): cell is Node {
    return cell.isNode()
  }

  isEdge(cell: Cell): cell is Edge {
    return cell.isEdge()
  }

  // #endregion

  // #region node

  // #endregion

  // #region edge

  // #endregion

  // #region view

  isFrozen() {
    return this.renderer.isFrozen()
  }

  freeze(options: ViewRenderer.FreezeOptions = {}) {
    this.renderer.freeze(options)
    return this
  }

  unfreeze(options: ViewRenderer.UnfreezeOptions = {}) {
    this.renderer.unfreeze(options)
    return this
  }

  isAsync() {
    return this.renderer.isAsync()
  }

  findView(ref: Cell | JQuery | Element) {
    if (ref instanceof Cell) {
      return this.findViewByCell(ref)
    }

    return this.findViewByElem(ref)
  }

  findViews(ref: Point.PointLike | Rectangle.RectangleLike) {
    if (Rectangle.isRectangleLike(ref)) {
      return this.findViewsInArea(ref)
    }

    if (Point.isPointLike(ref)) {
      return this.findViewsFromPoint(ref)
    }

    return []
  }

  findViewByCell(cellId: string | number): CellView | null
  findViewByCell(cell: Cell | null): CellView | null
  findViewByCell(
    cell: Cell | string | number | null | undefined,
  ): CellView | null {
    return this.renderer.findViewByCell(cell as Cell)
  }

  findViewByElem(elem: string | JQuery | Element | undefined | null) {
    return this.renderer.findViewByElem(elem)
  }

  findViewsFromPoint(x: number, y: number): CellView[]
  findViewsFromPoint(p: Point.PointLike): CellView[]
  findViewsFromPoint(x: number | Point.PointLike, y?: number) {
    const p = typeof x === 'number' ? { x, y: y as number } : x
    return this.renderer.findViewsFromPoint(p)
  }

  findViewsInArea(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: ViewRenderer.FindViewsInAreaOptions,
  ): CellView[]
  findViewsInArea(
    rect: Rectangle.RectangleLike,
    options?: ViewRenderer.FindViewsInAreaOptions,
  ): CellView[]
  findViewsInArea(
    x: number | Rectangle.RectangleLike,
    y?: number | ViewRenderer.FindViewsInAreaOptions,
    width?: number,
    height?: number,
    options?: ViewRenderer.FindViewsInAreaOptions,
  ) {
    const rect =
      typeof x === 'number'
        ? {
            x,
            y: y as number,
            width: width as number,
            height: height as number,
          }
        : x
    const localOptions =
      typeof x === 'number'
        ? options
        : (y as ViewRenderer.FindViewsInAreaOptions)
    return this.renderer.findViewsInArea(rect, localOptions)
  }

  isViewMounted(view: CellView) {
    return this.renderer.isViewMounted(view)
  }

  getMountedViews() {
    return this.renderer.getMountedViews()
  }

  getUnmountedViews() {
    return this.renderer.getUnmountedViews()
  }

  // #endregion

  // #region transform

  /**
   * Returns the current transformation matrix of the graph.
   */
  matrix(): DOMMatrix
  /**
   * Sets new transformation with the given `matrix`
   */
  matrix(mat: DOMMatrix | Dom.MatrixLike | null): this
  matrix(mat?: DOMMatrix | Dom.MatrixLike | null) {
    if (typeof mat === 'undefined') {
      return this.transform.getMatrix()
    }
    this.transform.setMatrix(mat)
    return this
  }

  resize(width?: number, height?: number) {
    this.transform.resize(width, height)
    return this
  }

  getScale() {
    return this.scale()
  }

  scale(): Dom.Scale
  scale(sx: number, sy?: number, ox?: number, oy?: number): this
  scale(
    sx?: number,
    sy: number = sx as number,
    ox: number = 0,
    oy: number = 0,
  ) {
    if (typeof sx === 'undefined') {
      return this.transform.getScale()
    }
    this.transform.scale(sx, sy, ox, oy)
    return this
  }

  rotate(): Dom.Rotation
  rotate(angle: number, cx?: number, cy?: number): this
  rotate(angle?: number, cx?: number, cy?: number) {
    if (typeof angle === 'undefined') {
      return this.transform.getRotation()
    }

    this.transform.rotate(angle, cx, cy)
    return this
  }

  translate(): Dom.Translation
  translate(tx: number, ty: number): this
  translate(tx?: number, ty?: number) {
    if (typeof tx === 'undefined') {
      return this.transform.getTranslation()
    }

    this.transform.translate(tx, ty as number)
    return this
  }

  setOrigin(ox?: number, oy?: number) {
    return this.translate(ox || 0, oy || 0)
  }

  fitToContent(
    gridWidth?: number,
    gridHeight?: number,
    padding?: NumberExt.SideOptions,
    options?: Transform.FitToContentOptions,
  ): Rectangle
  fitToContent(options?: Transform.FitToContentFullOptions): Rectangle
  fitToContent(
    gridWidth?: number | Transform.FitToContentFullOptions,
    gridHeight?: number,
    padding?: NumberExt.SideOptions,
    options?: Transform.FitToContentOptions,
  ) {
    return this.transform.fitToContent(gridWidth, gridHeight, padding, options)
  }

  scaleContentToFit(options: Transform.ScaleContentToFitOptions = {}) {
    this.transform.scaleContentToFit(options)
    return this
  }

  getContentArea(options: Transform.GetContentAreaOptions = {}) {
    return this.transform.getContentArea(options)
  }

  getContentBBox(options: Transform.GetContentAreaOptions = {}) {
    return this.transform.getContentBBox(options)
  }

  getArea() {
    return this.transform.getArea()
  }

  getRestrictedArea(view?: NodeView) {
    return this.transform.getRestrictedArea(view)
  }

  // #endregion

  // #region coord

  getClientMatrix() {
    return this.coord.getClientMatrix()
  }

  /**
   * Returns coordinates of the graph viewport, relative to the window.
   */
  getClientOffset() {
    return this.coord.getClientOffset()
  }

  /**
   * Returns coordinates of the graph viewport, relative to the document.
   */
  getPageOffset() {
    return this.coord.getPageOffset()
  }

  snapToGrid(p: Point.PointLike): Point
  snapToGrid(x: number, y: number): Point
  snapToGrid(x: number | Point.PointLike, y?: number) {
    return this.coord.snapToGrid(x, y)
  }

  /**
   * Transform the point `p` defined in the local coordinate system to
   * the graph coordinate system.
   */
  localToGraphPoint(p: Point.PointLike): Point
  localToGraphPoint(x: number, y: number): Point
  localToGraphPoint(x: number | Point.PointLike, y?: number) {
    return this.coord.localToGraphPoint(x, y)
  }

  localToClientPoint(p: Point.PointLike): Point
  localToClientPoint(x: number, y: number): Point
  localToClientPoint(x: number | Point.PointLike, y?: number) {
    return this.coord.localToClientPoint(x, y)
  }

  localToPagePoint(p: Point.PointLike): Point
  localToPagePoint(x: number, y: number): Point
  localToPagePoint(x: number | Point.PointLike, y?: number) {
    return this.coord.localToPagePoint(x, y)
  }

  localToGraphRect(rect: Rectangle.RectangleLike): Rectangle
  localToGraphRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Rectangle
  localToGraphRect(
    x: number | Rectangle.RectangleLike,
    y?: number,
    width?: number,
    height?: number,
  ) {
    return this.coord.localToGraphRect(x, y, width, height)
  }

  localToClientRect(rect: Rectangle.RectangleLike): Rectangle
  localToClientRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Rectangle
  localToClientRect(
    x: number | Rectangle.RectangleLike,
    y?: number,
    width?: number,
    height?: number,
  ) {
    return this.coord.localToClientRect(x, y, width, height)
  }

  localToPageRect(rect: Rectangle.RectangleLike): Rectangle
  localToPageRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Rectangle
  localToPageRect(
    x: number | Rectangle.RectangleLike,
    y?: number,
    width?: number,
    height?: number,
  ) {
    return this.coord.localToPageRect(x, y, width, height)
  }

  graphToLocalPoint(p: Point.PointLike): Point
  graphToLocalPoint(x: number, y: number): Point
  graphToLocalPoint(x: number | Point.PointLike, y?: number) {
    return this.coord.graphToLocalPoint(x, y)
  }

  clientToLocalPoint(p: Point.PointLike): Point
  clientToLocalPoint(x: number, y: number): Point
  clientToLocalPoint(x: number | Point.PointLike, y?: number) {
    return this.coord.clientToLocalPoint(x, y)
  }

  pageToLocalPoint(p: Point.PointLike): Point
  pageToLocalPoint(x: number, y: number): Point
  pageToLocalPoint(x: number | Point.PointLike, y?: number) {
    return this.coord.pageToLocalPoint(x, y)
  }

  graphToLocalRect(rect: Rectangle.RectangleLike): Rectangle
  graphToLocalRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Rectangle
  graphToLocalRect(
    x: number | Rectangle.RectangleLike,
    y?: number,
    width?: number,
    height?: number,
  ) {
    return this.coord.graphToLocalRect(x, y, width, height)
  }

  clientToLocalRect(rect: Rectangle.RectangleLike): Rectangle
  clientToLocalRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Rectangle
  clientToLocalRect(
    x: number | Rectangle.RectangleLike,
    y?: number,
    width?: number,
    height?: number,
  ) {
    return this.coord.clientToLocalRect(x, y, width, height)
  }

  pageToLocalRect(rect: Rectangle.RectangleLike): Rectangle
  pageToLocalRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Rectangle
  pageToLocalRect(
    x: number | Rectangle.RectangleLike,
    y?: number,
    width?: number,
    height?: number,
  ) {
    return this.coord.pageToLocalRect(x, y, width, height)
  }

  // #endregion

  // #region defs

  defineFilter(options: Defs.FilterOptions) {
    return this.defs.filter(options)
  }

  defineGradient(options: Defs.GradientOptions) {
    return this.defs.gradient(options)
  }

  defineMarker(options: Defs.MarkerOptions) {
    return this.defs.marker(options)
  }

  // #endregion

  // #region grid

  getGridSize() {
    return this.grid.getGridSize()
  }

  setGridSize(gridSize: number) {
    this.grid.setGridSize(gridSize)
    return this
  }

  showGrid() {
    this.grid.show()
    return this
  }

  hideGrid() {
    this.grid.hide()
    return this
  }

  clearGrid() {
    this.grid.clear()
    return this
  }

  drawGrid(options?: Grid.DrawGridOptions) {
    this.grid.draw(options)
    return this
  }

  // #endregion

  // #region background

  updateBackground() {
    this.background.update()
    return this
  }

  drawBackground(options?: Background.Options) {
    this.background.draw(options)
    return this
  }

  clearBackground() {
    this.background.clear()
    return this
  }

  // #endregion

  // #region clipboard

  isClipboardEnabled() {
    return !this.clipboard.disabled
  }

  enableClipboard() {
    this.clipboard.enable()
    return this
  }

  disableClipboard() {
    this.clipboard.disable()
    return this
  }

  toggleClipboard(enabled?: boolean) {
    if (enabled != null) {
      if (enabled !== this.isClipboardEnabled()) {
        if (enabled) {
          this.enableClipboard()
        } else {
          this.disableClipboard()
        }
      }
    } else {
      if (this.isClipboardEnabled()) {
        this.disableClipboard()
      } else {
        this.enableClipboard()
      }
    }

    return this
  }

  isClipboardEmpty() {
    return this.clipboard.isEmpty()
  }

  getCellsInClipboard() {
    return this.clipboard.cells
  }

  cleanClipboard() {
    this.clipboard.clean()
    return this
  }

  copy(cells: Cell[], options: Clipboard.CopyOptions = {}) {
    this.clipboard.copy(cells, options)
    return this
  }

  cut(cells: Cell[], options: Clipboard.CopyOptions = {}) {
    this.clipboard.cut(cells, options)
    return this
  }

  paste(options: Clipboard.PasteOptions = {}, graph: Graph = this) {
    return this.clipboard.paste(options, graph)
  }

  // #endregion

  // #region redo/undo

  isHistoryEnabled() {
    return !this.history.disabled
  }

  enableHistory() {
    this.history.enable()
    return this
  }

  disableHistory() {
    this.history.disable()
    return this
  }

  toggleHistory(enabled?: boolean) {
    if (enabled != null) {
      if (enabled !== this.isHistoryEnabled()) {
        if (enabled) {
          this.enableHistory()
        } else {
          this.disableHistory()
        }
      }
    } else {
      if (this.isHistoryEnabled()) {
        this.disableHistory()
      } else {
        this.enableHistory()
      }
    }

    return this
  }

  undo(options: KeyValue = {}) {
    this.history.undo(options)
    return this
  }

  undoAndCancel(options: KeyValue = {}) {
    this.history.cancel(options)
    return this
  }

  redo(options: KeyValue = {}) {
    this.history.redo(options)
    return this
  }

  canUndo() {
    return this.history.canUndo()
  }

  canRedo() {
    return this.history.canRedo()
  }

  cleanHistory(options: KeyValue = {}) {
    this.history.clean(options)
  }

  // #endregion

  // #region keyboard

  isKeyboardEnabled() {
    return !this.keyboard.disabled
  }

  enableKeyboard() {
    this.keyboard.enable()
    return this
  }

  disableKeyboard() {
    this.keyboard.disable()
    return this
  }

  toggleKeyboard(enabled?: boolean) {
    if (enabled != null) {
      if (enabled !== this.isKeyboardEnabled()) {
        if (enabled) {
          this.enableKeyboard()
        } else {
          this.disableKeyboard()
        }
      }
    } else {
      if (this.isKeyboardEnabled()) {
        this.disableKeyboard()
      } else {
        this.enableKeyboard()
      }
    }
    return this
  }

  bindKey(
    keys: string | string[],
    callback: Shortcut.Handler,
    action?: Shortcut.Action,
  ) {
    this.keyboard.on(keys, callback, action)
    return this
  }

  unbindKey(keys: string | string[], action?: Shortcut.Action) {
    this.keyboard.off(keys, action)
    return this
  }

  // #endregion

  // #region mousewheel

  isMouseWheelEnabled() {
    return !this.mousewheel.disabled
  }

  enableMouseWheel() {
    this.mousewheel.enable()
    return this
  }

  disableMouseWheel() {
    this.mousewheel.disable()
    return this
  }

  // #endregion

  // #region scroller

  @Decorator.checkScroller()
  lockScroller() {
    this.scroller.widget?.lock()
  }

  @Decorator.checkScroller()
  unlockScroller() {
    this.scroller.widget?.unlock()
  }

  @Decorator.checkScroller()
  updateScroller() {
    this.scroller.widget?.update()
  }

  @Decorator.checkScroller()
  getScrollbarPosition() {
    const scroller = this.scroller.widget!
    return scroller.scrollbarPosition()
  }

  @Decorator.checkScroller()
  setScrollbarPosition(
    left?: number,
    top?: number,
    options?: ScrollerWidget.ScrollOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.scrollbarPosition(left, top, options)
    return this
  }

  /**
   * Try to scroll to ensure that the position (x,y) on the graph (in local
   * coordinates) is at the center of the viewport. If only one of the
   * coordinates is specified, only scroll in the specified dimension and
   * keep the other coordinate unchanged.
   */
  @Decorator.checkScroller()
  scrollToPoint(
    x: number | null | undefined,
    y: number | null | undefined,
    options?: ScrollerWidget.ScrollOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.scrollToPoint(x, y, options)
    return this
  }

  /**
   * Try to scroll to ensure that the center of graph content is at the
   * center of the viewport.
   */
  @Decorator.checkScroller()
  scrollToContent(options?: ScrollerWidget.ScrollOptions) {
    const scroller = this.scroller.widget!
    scroller.scrollToContent(options)
    return this
  }

  /**
   * Try to scroll to ensure that the center of cell is at the center of
   * the viewport.
   */
  @Decorator.checkScroller()
  scrollToCell(cell: Cell, options?: ScrollerWidget.ScrollOptions) {
    const scroller = this.scroller.widget!
    scroller.scrollToCell(cell, options)
    return this
  }

  /**
   * Position the center of graph to the center of the viewport.
   */
  center(optons?: ScrollerWidget.CenterOptions) {
    return this.centerPoint(optons)
  }

  /**
   * Position the point (x,y) on the graph (in local coordinates) to the
   * center of the viewport. If only one of the coordinates is specified,
   * only center along the specified dimension and keep the other coordinate
   * unchanged.
   */
  centerPoint(
    x: number,
    y: null | number,
    options?: ScrollerWidget.CenterOptions,
  ): this
  centerPoint(
    x: null | number,
    y: number,
    options?: ScrollerWidget.CenterOptions,
  ): this
  /**
   * Position the center of graph to the center of the viewport.
   */
  centerPoint(optons?: ScrollerWidget.CenterOptions): this
  @Decorator.checkScroller()
  centerPoint(
    x?: number | null | ScrollerWidget.CenterOptions,
    y?: number | null,
    options?: ScrollerWidget.CenterOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.centerPoint(x as number, y as number, options)
    return this
  }

  @Decorator.checkScroller()
  centerContent(options?: ScrollerWidget.PositionContentOptions) {
    const scroller = this.scroller.widget!
    scroller.centerContent(options)
    return this
  }

  @Decorator.checkScroller()
  centerCell(cell: Cell, options?: ScrollerWidget.CenterOptions) {
    const scroller = this.scroller.widget!
    scroller.centerCell(cell, options)
    return this
  }

  @Decorator.checkScroller()
  positionContent(
    pos: ScrollerWidget.Direction,
    options?: ScrollerWidget.PositionContentOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.positionContent(pos, options)
    return this
  }

  @Decorator.checkScroller()
  positionCell(
    cell: Cell,
    direction: ScrollerWidget.Direction,
    options?: ScrollerWidget.CenterOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.positionCell(cell, direction, options)
    return this
  }

  @Decorator.checkScroller()
  positionRect(
    rect: Rectangle.RectangleLike,
    direction: ScrollerWidget.Direction,
    options?: ScrollerWidget.CenterOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.positionRect(rect, direction, options)
    return this
  }

  @Decorator.checkScroller()
  positionPoint(
    point: Point.PointLike,
    x: number | string,
    y: number | string,
    options: ScrollerWidget.CenterOptions = {},
  ) {
    const scroller = this.scroller.widget!
    scroller.positionPoint(point, x, y, options)
    return this
  }

  zoom(): number
  zoom(factor: number, options?: ScrollerWidget.ZoomOptions): this
  @Decorator.checkScroller()
  zoom(factor?: number, options?: ScrollerWidget.ZoomOptions) {
    const scroller = this.scroller.widget!
    if (factor == null) {
      return scroller.zoom()
    }
    scroller.zoom(factor, options)
    return this
  }

  zoomToRect(
    rect: Rectangle.RectangleLike,
    options: Transform.ScaleContentToFitOptions = {},
  ) {
    const scroller = this.scroller.widget!
    scroller.zoomToRect(rect, options)
    return this
  }

  zoomToFit(
    options: Transform.GetContentAreaOptions &
      Transform.ScaleContentToFitOptions = {},
  ) {
    const scroller = this.scroller.widget!
    scroller.zoomToFit(options)
    return this
  }

  transitionToPoint(
    p: Point.PointLike,
    options?: ScrollerWidget.TransitionOptions,
  ): this
  transitionToPoint(
    x: number,
    y: number,
    options?: ScrollerWidget.TransitionOptions,
  ): this
  transitionToPoint(
    x: number | Point.PointLike,
    y?: number | ScrollerWidget.TransitionOptions,
    options?: ScrollerWidget.TransitionOptions,
  ) {
    const scroller = this.scroller.widget!
    scroller.transitionToPoint(x as number, y as number, options)
    return this
  }

  transitionToRect(
    rect: Rectangle.RectangleLike,
    options: ScrollerWidget.TransitionToRectOptions = {},
  ) {
    const scroller = this.scroller.widget!
    scroller.transitionToRect(rect, options)
    return this
  }

  isPannable() {
    return this.scroller.pannable
  }

  enablePanning() {
    this.scroller.enablePanning()
    return this
  }

  disablePanning() {
    this.scroller.disablePanning()
    return this
  }

  togglePanning(pannable?: boolean) {
    if (pannable == null) {
      if (this.isPannable()) {
        this.disablePanning()
      } else {
        this.enablePanning()
      }
    } else {
      if (pannable !== this.isPannable()) {
        if (pannable) {
          this.enablePanning()
        } else {
          this.disablePanning()
        }
      }
    }

    return this
  }

  // #endregion

  // #region selection

  isSelectionEnabled() {
    return !this.selection.disabled
  }

  enableSelection() {
    this.selection.enable()
    return this
  }

  disableSelection() {
    this.selection.disable()
    return this
  }

  toggleSelection(enabled?: boolean) {
    if (enabled != null) {
      if (enabled !== this.isSelectionEnabled()) {
        if (enabled) {
          this.enableSelection()
        } else {
          this.disableSelection()
        }
      }
    } else {
      if (this.isSelectionEnabled()) {
        this.disableSelection()
      } else {
        this.enableSelection()
      }
    }

    return this
  }

  isMultipleSelection() {
    return this.selection.isMultiple()
  }

  enableMultipleSelection() {
    this.selection.enableMultiple()
    return this
  }

  disableMultipleSelection() {
    this.selection.disableMultiple()
    return this
  }

  toggleMultipleSelection(multiple?: boolean) {
    if (multiple != null) {
      if (multiple !== this.isMultipleSelection()) {
        if (multiple) {
          this.enableMultipleSelection()
        } else {
          this.disableMultipleSelection()
        }
      }
    } else {
      if (this.isMultipleSelection()) {
        this.disableMultipleSelection()
      } else {
        this.enableMultipleSelection()
      }
    }

    return this
  }

  isSelectionMovable() {
    return this.selection.widget.options.movable !== false
  }

  enableSelectionMovable() {
    this.selection.widget.options.movable = true
    return this
  }

  disableSelectionMovable() {
    this.selection.widget.options.movable = false
    return this
  }

  toggleSelectionMovable(movable?: boolean) {
    if (movable != null) {
      if (movable !== this.isSelectionMovable()) {
        if (movable) {
          this.enableSelectionMovable()
        } else {
          this.disableSelectionMovable()
        }
      }
    } else {
      if (this.isSelectionMovable()) {
        this.disableSelectionMovable()
      } else {
        this.enableSelectionMovable()
      }
    }

    return this
  }

  isRubberbandEnabled() {
    return !this.selection.rubberbandDisabled
  }

  enableRubberband() {
    this.selection.enableRubberband()
    return this
  }

  disableRubberband() {
    this.selection.disableRubberband()
    return this
  }

  toggleRubberband(enabled?: boolean) {
    if (enabled != null) {
      if (enabled !== this.isRubberbandEnabled()) {
        if (enabled) {
          this.enableRubberband()
        } else {
          this.disableRubberband()
        }
      }
    } else {
      if (this.isRubberbandEnabled()) {
        this.disableRubberband()
      } else {
        this.enableRubberband()
      }
    }

    return this
  }

  isStrictRubberband() {
    return this.selection.widget.options.strict === true
  }

  enableStrictRubberband() {
    this.selection.widget.options.strict = true
    return this
  }

  disableStrictRubberband() {
    this.selection.widget.options.strict = false
    return this
  }

  toggleStrictRubberband(strict?: boolean) {
    if (strict != null) {
      if (strict !== this.isStrictRubberband()) {
        if (strict) {
          this.enableStrictRubberband()
        } else {
          this.disableStrictRubberband()
        }
      }
    } else {
      if (this.isStrictRubberband()) {
        this.disableStrictRubberband()
      } else {
        this.enableStrictRubberband()
      }
    }

    return this
  }

  setRubberbandModifiers(modifiers?: string | ModifierKey[] | null) {
    this.selection.setModifiers(modifiers)
  }

  setSelectionFilter(filter?: Selection.Filter) {
    this.selection.setFilter(filter)
    return this
  }

  setSelectionDisplayContent(content?: Selection.Content) {
    this.selection.setContent(content)
    return this
  }

  isSelectionEmpty() {
    return this.selection.isEmpty()
  }

  cleanSelection() {
    this.selection.clean()
    return this
  }

  getSelectedCells() {
    return this.selection.cells
  }

  getSelectedCellCount() {
    return this.selection.length
  }

  isSelected(cell: Cell | string) {
    return this.selection.isSelected(cell)
  }

  select(cells: Cell | Cell[], options: Collection.AddOptions = {}) {
    this.selection.select(cells, options)
    return this
  }

  unselect(cells: Cell | Cell[], options: Collection.RemoveOptions = {}) {
    this.selection.unselect(cells, options)
    return this
  }

  // #endregion

  // #region snapline

  isSnaplineEnabled() {
    return !this.snapline.widget.disabled
  }

  enableSnapline() {
    this.snapline.widget.enable()
    return this
  }

  disableSnapline() {
    this.snapline.widget.disable()
    return this
  }

  toggleSnapline(enabled?: boolean) {
    if (enabled != null) {
      if (enabled !== this.isSnaplineEnabled()) {
        if (enabled) {
          this.enableSnapline()
        } else {
          this.disableSnapline()
        }
      }
    } else {
      if (this.isSnaplineEnabled()) {
        this.disableSnapline()
      } else {
        this.enableSnapline()
      }
      return this
    }
  }

  hideSnapline() {
    this.snapline.widget.hide()
    return this
  }

  setSnaplineFilter(filter?: Snapline.Filter) {
    this.snapline.widget.setFilter(filter)
    return this
  }

  isSnaplineOnResizingEnabled() {
    return this.snapline.widget.options.resizing === true
  }

  enableSnaplineOnResizing() {
    this.snapline.widget.options.resizing = true
    return this
  }

  disableSnaplineOnResizing() {
    this.snapline.widget.options.resizing = false
    return this
  }

  toggleSnaplineOnResizing(enableOnResizing?: boolean) {
    if (enableOnResizing != null) {
      if (enableOnResizing !== this.isSnaplineOnResizingEnabled()) {
        if (enableOnResizing) {
          this.enableSnaplineOnResizing()
        } else {
          this.disableSnaplineOnResizing()
        }
      }
    } else {
      if (this.isSnaplineOnResizingEnabled()) {
        this.disableSnaplineOnResizing()
      } else {
        this.enableSnaplineOnResizing()
      }
    }
    return this
  }

  isSharpSnapline() {
    return this.snapline.widget.options.sharp === true
  }

  enableSharpSnapline() {
    this.snapline.widget.options.sharp = true
    return this
  }

  disableSharpSnapline() {
    this.snapline.widget.options.sharp = false
    return this
  }

  toggleSharpSnapline(sharp?: boolean) {
    if (sharp != null) {
      if (sharp !== this.isSharpSnapline()) {
        if (sharp) {
          this.enableSharpSnapline()
        } else {
          this.disableSharpSnapline()
        }
      }
    } else {
      if (this.isSharpSnapline()) {
        this.disableSharpSnapline()
      } else {
        this.enableSharpSnapline()
      }
    }
    return this
  }

  getSnaplineTolerance() {
    return this.snapline.widget.options.tolerance
  }

  setSnaplineTolerance(tolerance: number) {
    this.snapline.widget.options.tolerance = tolerance
    return this
  }

  // #endregion

  // #region tools

  removeTools() {
    this.emit('tools:remove')
    return this
  }

  hideTools() {
    this.emit('tools:hide')
    return this
  }

  showTools() {
    this.emit('tools:show')
    return this
  }

  // #endregion

  // #region format

  toSVG(callback: Format.ToSVGCallback, options: Format.ToSVGOptions = {}) {
    this.format.toSVG(callback, options)
  }

  toDataURL(callback: Format.ToSVGCallback, options: Format.ToDataURLOptions) {
    this.format.toDataURL(callback, options)
  }

  toPNG(callback: Format.ToSVGCallback, options: Format.ToImageOptions = {}) {
    this.format.toPNG(callback, options)
  }

  toJPEG(callback: Format.ToSVGCallback, options: Format.ToImageOptions = {}) {
    this.format.toJPEG(callback, options)
  }

  // #endregion

  // #region print

  printPreview(options?: Partial<Print.Options>) {
    this.print.show(options)
  }

  // #endregion

  // #region dispose

  @Basecoat.dispose()
  dispose() {
    this.view.dispose()
    this.renderer.dispose()
  }

  // #endregion
}

export namespace Graph {
  export import View = GraphView
  export import Hook = HookManager
  export import Renderer = ViewRenderer
  export import Keyboard = Shortcut
  export import MouseWheel = Wheel
  export import BaseManager = Base
  export import DefsManager = Defs
  export import GridManager = Grid
  export import CoordManager = Coord
  export import PrintManager = Print
  export import FormatManager = Format
  export import MiniMapManager = MiniMap
  export import HistoryManager = History
  export import SnaplineManager = Snapline
  export import ScrollerManager = Scroller
  export import ClipboardManager = Clipboard
  export import TransformManager = Transform
  export import HighlightManager = Highlight
  export import BackgroundManager = Background
  export import SelectionManager = Selection
}

export namespace Graph {
  export interface Options extends GraphOptions.Manual {}
}

export namespace Graph {
  export function render(
    options: Partial<Options>,
    data?: Model.FromJSONData,
  ): Graph
  export function render(
    container: HTMLElement,
    data?: Model.FromJSONData,
  ): Graph
  export function render(
    options: Partial<Options> | HTMLElement,
    data?: Model.FromJSONData,
  ): Graph {
    const graph =
      options instanceof HTMLElement
        ? new Graph({ container: options })
        : new Graph(options)

    if (data != null) {
      graph.fromJSON(data)
    }

    return graph
  }
}

export namespace Graph {
  export const registerNode = Node.registry.register
  export const registerEdge = Edge.registry.register
  export const registerView = CellView.registry.register
  export const registerAttr = AttrDefinition.registry.register
  export const registerGrid = GridDefinition.registry.register
  export const registerFilter = FilterDefinition.registry.register
  export const registerNodeTool = NodeTool.registry.register
  export const registerEdgeTool = EdgeTool.registry.register
  export const registerBackground = BackgroundDefinition.registry.register
  export const registerHighlighter = HighlightDefinition.registry.register
  export const registerPortLayout = PortLayout.registry.register
  export const registerPortLabelLayout = PortLabelLayout.registry.register
  export const registerRouter = Router.registry.register
  export const registerConnector = Connector.registry.register
  export const registerNodeConnectionAnchor =
    NodeConnectionAnchor.registry.register
  export const registerEdgeConnectionAnchor =
    EdgeConnectionAnchor.registry.register
  export const registerConnectionPoint = ConnectionPoint.registry.register
  export const registerConnectionStrategy = ConnectionStrategy.registry.register
  export const registerHTMLComponent = HTML.componentRegistry.register
}

export namespace Graph {
  export const unregisterNode = Node.registry.unregister
  export const unregisterEdge = Edge.registry.unregister
  export const unregisterView = CellView.registry.unregister
  export const unregisterAttr = AttrDefinition.registry.unregister
  export const unregisterGrid = GridDefinition.registry.unregister
  export const unregisterFilter = FilterDefinition.registry.unregister
  export const unregisterNodeTool = NodeTool.registry.unregister
  export const unregisterEdgeTool = EdgeTool.registry.unregister
  export const unregisterBackground = BackgroundDefinition.registry.unregister
  export const unregisterHighlighter = HighlightDefinition.registry.unregister
  export const unregisterPortLayout = PortLayout.registry.unregister
  export const unregisterPortLabelLayout = PortLabelLayout.registry.unregister
  export const unregisterRouter = Router.registry.unregister
  export const unregisterConnector = Connector.registry.unregister
  export const unregisterNodeConnectionAnchor =
    NodeConnectionAnchor.registry.unregister
  export const unregisterEdgeConnectionAnchor =
    EdgeConnectionAnchor.registry.unregister
  export const unregisterConnectionPoint = ConnectionPoint.registry.unregister
  export const unregisterConnectionStrategy =
    ConnectionStrategy.registry.unregister
  export const unregisterHTMLComponent = HTML.componentRegistry.unregister
}