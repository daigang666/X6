import { Util } from '../../global'
import { KeyValue } from '../../types'
import { Angle, Point } from '../../geometry'
import { Node } from '../../model/node'
import { NodeView } from '../../view/node'
import { Widget } from '../common'
import { notify } from './util'

export class Transform extends Widget<Transform.Options> {
  protected handle: Element | null
  protected prevShift: number
  protected $container: JQuery<HTMLElement>

  protected get node() {
    return this.cell as Node
  }

  protected get containerClassName() {
    return this.prefixClassName('widget-transform')
  }

  protected get resizeClassName() {
    return `${this.containerClassName}-resize`
  }

  protected get rotateClassName() {
    return `${this.containerClassName}-rotate`
  }

  protected init(options: Transform.Options) {
    this.options = {
      ...Private.defaultOptions,
      ...options,
    }

    this.render()
    this.startListening()
  }

  protected startListening() {
    this.delegateEvents({
      [`mousedown .${this.resizeClassName}`]: 'startResizing',
      [`touchstart .${this.resizeClassName}`]: 'startResizing',
      [`mousedown .${this.rotateClassName}`]: 'startRotating',
      [`touchstart .${this.rotateClassName}`]: 'startRotating',
    })

    this.model.on('*', this.update, this)
    this.model.on('reseted', this.remove, this)
    this.node.on('removed', this.remove, this)

    this.graph.on('scale', this.update, this)
    this.graph.on('translate', this.update, this)

    super.startListening()
  }

  protected stopListening() {
    this.undelegateEvents()

    this.model.off('*', this.update, this)
    this.model.off('reseted', this.remove, this)
    this.node.off('removed', this.remove, this)

    this.graph.off('scale', this.update, this)
    this.graph.off('translate', this.update, this)

    super.stopListening()
  }

  protected onRemove() {
    this.stopListening()
  }

  protected renderHandles() {
    this.container = document.createElement('div')
    this.$container = this.$(this.container)

    const $knob = this.$('<div/>').prop('draggable', false)
    const $rotate = $knob.clone().addClass(this.rotateClassName)

    const $resizes = Private.POSITIONS.map((pos) => {
      return $knob
        .clone()
        .addClass(this.resizeClassName)
        .attr('data-position', pos)
    })
    this.empty()
    this.$container.append($resizes, $rotate)
  }

  render() {
    this.renderHandles()
    this.$container
      .addClass(this.containerClassName)
      .toggleClass(
        'no-orth-resize',
        this.options.preserveAspectRatio || !this.options.orthogonalResizing,
      )
      .toggleClass('no-resize', !this.options.resizable)
      .toggleClass('no-rotate', !this.options.rotatable)

    if (this.options.className) {
      this.$container.addClass(this.options.className)
    }

    this.graph.container.appendChild(this.container)

    return this.update()
  }

  update() {
    const ctm = this.graph.matrix()
    const bbox = this.node.getBBox()

    bbox.x *= ctm.a
    bbox.x += ctm.e
    bbox.y *= ctm.d
    bbox.y += ctm.f
    bbox.width *= ctm.a
    bbox.height *= ctm.d

    const angle = Angle.normalize(this.node.getAngle())
    const transform = angle !== 0 ? `rotate(${angle}deg)` : ''
    this.$container.css({
      transform,
      width: bbox.width,
      height: bbox.height,
      left: bbox.x,
      top: bbox.y,
    })

    this.updateResizerDirections()

    return this
  }

  protected updateResizerDirections() {
    // Update the directions on the resizer divs while the node being rotated.
    // The directions are represented by cardinal points (N,S,E,W). For example
    // the div originally pointed to north needs to be changed to point to south
    // if the node was rotated by 180 degrees.
    const angle = Angle.normalize(this.node.getAngle())
    const shift = Math.floor(angle * (Private.DIRECTIONS.length / 360))
    if (shift !== this.prevShift) {
      // Create the current directions array based on the calculated shift.
      const directions = Private.DIRECTIONS.slice(shift).concat(
        Private.DIRECTIONS.slice(0, shift),
      )

      const className = (dir: string) =>
        `${this.containerClassName}-cursor-${dir}`

      this.$container
        .find(`.${this.resizeClassName}`)
        .removeClass(Private.DIRECTIONS.map((dir) => className(dir)).join(' '))
        .each((index, elem) => {
          this.$(elem).addClass(className(directions[index]))
        })
      this.prevShift = shift
    }
  }

  protected getTrueDirection(dir: Node.ResizeDirection) {
    const angle = Angle.normalize(this.node.getAngle())
    let index = Private.POSITIONS.indexOf(dir)

    index = index + Math.floor(angle * (Private.POSITIONS.length / 360))
    index = index % Private.POSITIONS.length

    return Private.POSITIONS[index]
  }

  protected toValidResizeDirection(dir: string): Node.ResizeDirection {
    return (
      ({
        top: 'top-left',
        bottom: 'bottom-right',
        left: 'bottom-left',
        right: 'top-right',
      } as KeyValue)[dir] || dir
    )
  }

  protected startResizing(evt: JQuery.MouseDownEvent) {
    evt.stopPropagation()
    this.model.startBatch('resize', { cid: this.cid })
    const relativeDirection = this.$(evt.target).attr(
      'data-position',
    ) as Node.ResizeDirection
    this.prepareResizing(evt, relativeDirection)
    this.startAction(evt)
  }

  protected prepareResizing(
    evt: JQuery.TriggeredEvent,
    relativeDirection: Node.ResizeDirection,
  ) {
    const trueDirection = this.getTrueDirection(relativeDirection)
    let rx = 0
    let ry = 0
    relativeDirection.split('-').forEach((direction) => {
      rx = ({ left: -1, right: 1 } as KeyValue)[direction] || rx
      ry = ({ top: -1, bottom: 1 } as KeyValue)[direction] || ry
    })

    const direction = this.toValidResizeDirection(relativeDirection)
    const selector = ({
      'top-right': 'bottomLeft',
      'top-left': 'bottomRight',
      'bottom-left': 'topRight',
      'bottom-right': 'topLeft',
    } as KeyValue)[direction]

    this.setEventData<EventData.Resizing>(evt, {
      selector,
      direction,
      trueDirection,
      relativeDirection,
      resizeX: rx,
      resizeY: ry,
      angle: Angle.normalize(this.node.getAngle()),
      action: 'resizing',
    })
  }

  protected startRotating(evt: JQuery.MouseDownEvent) {
    evt.stopPropagation()

    this.model.startBatch('rotate', { cid: this.cid })

    const center = this.node.getBBox().getCenter()
    const client = this.graph.snapToGrid(evt.clientX, evt.clientY)
    this.setEventData<EventData.Rotating>(evt, {
      center,
      action: 'rotating',
      angle: Angle.normalize(this.node.getAngle()),
      start: Point.create(client).theta(center),
    })
    this.startAction(evt)
  }

  protected onMouseMove(evt: JQuery.MouseMoveEvent) {
    let data = this.getEventData<EventData.Resizing | EventData.Rotating>(evt)
    if (data.action) {
      const e = this.normalizeEvent(evt)
      const pos = this.graph.snapToGrid(e.clientX, e.clientY)
      const gridSize = this.graph.getGridSize()
      const node = this.node
      const options = this.options

      if (data.action === 'resizing') {
        data = data as EventData.Resizing
        if (!data.resized) {
          data.resized = true
        }

        const currentBBox = node.getBBox()
        const requestedSize = Point.create(pos)
          .rotate(data.angle, currentBBox.getCenter())
          .diff(currentBBox[data.selector])

        let width = data.resizeX
          ? requestedSize.x * data.resizeX
          : currentBBox.width

        let height = data.resizeY
          ? requestedSize.y * data.resizeY
          : currentBBox.height

        const rawWidth = width
        const rawHeight = height

        width = Util.snapToGrid(width, gridSize)
        height = Util.snapToGrid(height, gridSize)
        width = Math.max(width, options.minWidth || gridSize)
        height = Math.max(height, options.minHeight || gridSize)
        width = Math.min(width, options.maxWidth || Infinity)
        height = Math.min(height, options.maxHeight || Infinity)

        if (options.preserveAspectRatio) {
          const candidateWidth =
            (currentBBox.width * height) / currentBBox.height
          const candidateHeight =
            (currentBBox.height * width) / currentBBox.width

          if (width < candidateWidth) {
            height = candidateHeight
          } else {
            width = candidateWidth
          }
        }

        const relativeDirection = data.relativeDirection
        if (rawWidth <= -width || rawHeight <= -height) {
          let reverted: Node.ResizeDirection

          if (relativeDirection === 'left') {
            if (rawWidth <= -width) {
              reverted = 'right'
            }
          } else if (relativeDirection === 'right') {
            if (rawWidth <= -width) {
              reverted = 'left'
            }
          } else if (relativeDirection === 'top') {
            if (rawHeight <= -height) {
              reverted = 'bottom'
            }
          } else if (relativeDirection === 'bottom') {
            if (rawHeight <= -height) {
              reverted = 'top'
            }
          } else if (relativeDirection === 'top-left') {
            if (rawWidth <= -width && rawHeight <= -height) {
              reverted = 'bottom-right'
            } else if (rawWidth <= -width) {
              reverted = 'top-right'
            } else if (rawHeight <= -height) {
              reverted = 'bottom-left'
            }
          } else if (relativeDirection === 'top-right') {
            if (rawWidth <= -width && rawHeight <= -height) {
              reverted = 'bottom-left'
            } else if (rawWidth <= -width) {
              reverted = 'top-left'
            } else if (rawHeight <= -height) {
              reverted = 'bottom-right'
            }
          } else if (relativeDirection === 'bottom-left') {
            if (rawWidth <= -width && rawHeight <= -height) {
              reverted = 'top-right'
            } else if (rawWidth <= -width) {
              reverted = 'bottom-right'
            } else if (rawHeight <= -height) {
              reverted = 'top-left'
            }
          } else if (relativeDirection === 'bottom-right') {
            if (rawWidth <= -width && rawHeight <= -height) {
              reverted = 'top-left'
            } else if (rawWidth <= -width) {
              reverted = 'bottom-left'
            } else if (rawHeight <= -height) {
              reverted = 'top-right'
            }
          }

          const revertedDir = reverted!
          this.stopHandle()
          const $handle = this.$container.find(
            `.${this.resizeClassName}[data-position="${revertedDir}"]`,
          )
          this.startHandle($handle[0])
          this.prepareResizing(evt, revertedDir)
          this.onMouseMove(evt)
        }

        if (currentBBox.width !== width || currentBBox.height !== height) {
          const resizeOptions: Node.ResizeOptions = {
            ui: true,
            direction: data.direction,
            relativeDirection: data.relativeDirection,
            trueDirection: data.trueDirection,
            minWidth: options.minWidth!,
            minHeight: options.minHeight!,
            maxWidth: options.maxWidth!,
            maxHeight: options.maxHeight!,
            preserveAspectRatio: options.preserveAspectRatio === true,
          }
          node.resize(width, height, resizeOptions)
        }
      } else if (data.action === 'rotating') {
        data = data as EventData.Rotating
        if (!data.rotated) {
          data.rotated = true
        }

        const theta = data.start - Point.create(pos).theta(data.center)
        let target = data.angle + theta
        if (options.rotateGrid) {
          target = Util.snapToGrid(target, options.rotateGrid)
        }
        node.rotate(target, { absolute: true })
      }
    }
  }

  protected onMouseUp(evt: JQuery.MouseUpEvent) {
    let data = this.getEventData<EventData.Resizing | EventData.Rotating>(evt)
    if (data.action) {
      this.stopAction(evt)
      this.model.stopBatch(data.action === 'resizing' ? 'resize' : 'rotate', {
        cid: this.cid,
      })

      if (data.action === 'resizing') {
        data = data as EventData.Resizing
        if (data.resized) {
          notify(
            'node:resized',
            evt,
            this.graph.findViewByCell(this.cell) as NodeView,
          )
        }
      } else {
        data = data as EventData.Rotating
        if (data.rotated) {
          notify(
            'node:rotated',
            evt,
            this.graph.findViewByCell(this.cell) as NodeView,
          )
        }
      }
    }
  }

  protected startHandle(handle: Element) {
    this.handle = handle

    this.$(handle).addClass(`${this.containerClassName}-active-handle`)
    this.$container.addClass(`${this.containerClassName}-active`)

    const pos = handle.getAttribute('data-position') as Node.ResizeDirection
    if (pos) {
      const dir = Private.DIRECTIONS[Private.POSITIONS.indexOf(pos)]
      this.$container.addClass(`${this.containerClassName}-cursor-${dir}`)
    }
  }

  protected stopHandle() {
    if (this.handle) {
      this.$(this.handle).removeClass(
        `${this.containerClassName}-active-handle`,
      )
      this.$container.removeClass(`${this.containerClassName}-active`)

      const pos = this.handle.getAttribute(
        'data-position',
      ) as Node.ResizeDirection
      if (pos) {
        const dir = Private.DIRECTIONS[Private.POSITIONS.indexOf(pos)]
        this.$container.removeClass(`${this.containerClassName}-cursor-${dir}`)
      }

      this.handle = null
    }
  }

  protected startAction(evt: JQuery.MouseDownEvent) {
    const elem = evt.target
    this.startHandle(elem)
    this.graph.view.undelegateEvents()
    this.delegateDocumentEvents(Private.documentEvents, evt.data)

    // const data = this.getEventData<EventData.Resizing | EventData.Rotating>(evt)
    // if (data.action === 'resizing') {
    //   this.node.notify('node:resize', { node: this.node })
    // } else if (data.action === 'rotating') {
    //   this.node.notify('node:rotate', { node: this.node })
    // }
  }

  protected stopAction(evt: JQuery.MouseUpEvent) {
    this.stopHandle()
    this.undelegateDocumentEvents()
    this.graph.view.delegateEvents()

    // const data = this.getEventData<EventData.Resizing | EventData.Rotating>(evt)
    // if (data.action === 'resizing') {
    //   this.node.notify('node:resized', { node: this.node })
    // } else if (data.action === 'rotating') {
    //   this.node.notify('node:rotated', { node: this.node })
    // }
  }
}

export namespace Transform {
  export type Direction = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

  export interface Options extends Widget.Options {
    className?: string

    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    resizable?: boolean

    rotatable?: boolean
    rotateGrid?: number
    orthogonalResizing?: boolean
    /**
     * Set to `true` if you want the resizing to preserve the
     * aspect ratio of the node. Default is `false`.
     */
    preserveAspectRatio?: boolean
  }
}

namespace Private {
  export const DIRECTIONS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
  export const POSITIONS: Node.ResizeDirection[] = [
    'top-left',
    'top',
    'top-right',
    'right',
    'bottom-right',
    'bottom',
    'bottom-left',
    'left',
  ]

  export const documentEvents = {
    mousemove: 'onMouseMove',
    touchmove: 'onMouseMove',
    mouseup: 'onMouseUp',
    touchend: 'onMouseUp',
  }

  export const defaultOptions: Transform.Options = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: Infinity,
    maxHeight: Infinity,
    rotateGrid: 15,
    rotatable: true,
    preserveAspectRatio: false,
    orthogonalResizing: true,
  }
}

namespace EventData {
  export interface Resizing {
    action: 'resizing'
    selector: 'bottomLeft' | 'bottomRight' | 'topRight' | 'topLeft'
    direction: Node.ResizeDirection
    trueDirection: Node.ResizeDirection
    relativeDirection: Node.ResizeDirection
    resizeX: number
    resizeY: number
    angle: number
    resized?: boolean
  }

  export interface Rotating {
    action: 'rotating'
    center: Point.PointLike
    angle: number
    start: number
    rotated?: boolean
  }
}