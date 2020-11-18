import React, { useEffect } from 'react'
import { Tabs, Row, Col, Select, Slider, Input, Checkbox } from 'antd'
import FlowGraph from '@/pages/Graph'

const { TabPane } = Tabs

enum GRID_TYPE {
  DOT = 'dot',
  FIXED_DOT = 'fixedDot',
  MESH = 'mesh',
  DOUBLE_MESH = 'doubleMesh',
}

enum REPEAT_TYPE {
  NO_REPEAT = 'no-repeat',
  REPEAT = 'repeat',
  REPEAT_X = 'repeat-x',
  REPEAT_Y = 'repeat-y',
  ROUND = 'round',
  SPACE = 'space',
  FLIPX = 'flipX',
  FLIPY = 'flipY',
  FLIPXY = 'flipXY',
  WATERMARK = 'watermark',
}

interface IProps {
  attrs: {
    [key: string]: any
  }
  setAttr: (key: string, value: any) => void
}

const bgImageDataURL =
  'data:image/png;base64,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'
const tryToJSON = (val: string) => {
  try {
    return JSON.parse(val)
  } catch (error) {
    return val
  }
}

export default function (props: IProps) {
  const { attrs, setAttr } = props

  useEffect(() => {
    let options
    if (attrs.type === 'doubleMesh') {
      options = {
        type: attrs.type,
        args: [
          {
            color: attrs.color,
            thickness: attrs.thickness,
          },
          {
            color: attrs.colorSecond,
            thickness: attrs.thicknessSecond,
            factor: attrs.factor,
          },
        ],
      }
    } else {
      options = {
        type: attrs.type,
        args: [
          {
            color: attrs.color,
            thickness: attrs.thickness,
          },
        ],
      }
    }
    const { graph } = FlowGraph
    graph.drawGrid(options)
  }, [
    attrs.type,
    attrs.color,
    attrs.thickness,
    attrs.thicknessSecond,
    attrs.colorSecond,
    attrs.factor,
  ])

  useEffect(() => {
    const { graph } = FlowGraph
    graph.setGridSize(attrs.size)
  }, [attrs.size])

  useEffect(() => {
    const options = {
      color: attrs.bgColor,
      image: attrs.showImage ? bgImageDataURL : undefined,
      repeat: attrs.repeat,
      angle: attrs.angle,
      size: tryToJSON(attrs.bgSize),
      position: tryToJSON(attrs.position),
      opacity: attrs.opacity,
    }
    const { graph } = FlowGraph
    graph.drawBackground(options)
  }, [
    attrs.bgColor,
    attrs.showImage,
    attrs.repeat,
    attrs.angle,
    attrs.bgSize,
    attrs.position,
    attrs.opacity,
  ])

  const onShowGrid = (show: boolean) => {
    const { graph } = FlowGraph
    if (show) {
      graph.showGrid()
    } else {
      graph.hideGrid()
    }
    setAttr('showGrid', show)
  }

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="网格" key="1">
        <Row align="middle">
          <Checkbox
            checked={attrs.showGrid}
            onChange={(e) => onShowGrid(e.target.checked)}
          >
            Enable
          </Checkbox>
        </Row>
        <Row align="middle">
          <Col span={10}>Grid Type</Col>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              value={attrs.type}
              onChange={(val) => setAttr('type', val)}
            >
              <Select.Option value={GRID_TYPE.DOT}>Dot</Select.Option>
              <Select.Option value={GRID_TYPE.FIXED_DOT}>
                Fixed Dot
              </Select.Option>
              <Select.Option value={GRID_TYPE.MESH}>Mesh</Select.Option>
              <Select.Option value={GRID_TYPE.DOUBLE_MESH}>
                Double Mesh
              </Select.Option>
            </Select>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={10}>Grid Size</Col>
          <Col span={10}>
            <Slider
              min={1}
              max={20}
              step={1}
              value={attrs.size}
              onChange={(val: number) => setAttr('size', val)}
            />
          </Col>
          <Col span={2}>
            <div className="result">{attrs.size}</div>
          </Col>
        </Row>
        {attrs.type === 'doubleMesh' ? (
          <React.Fragment>
            <Row align="middle">
              <Col span={10}>Primary Color</Col>
              <Col span={12}>
                <Input
                  type="color"
                  value={attrs.color}
                  style={{ width: '100%' }}
                  onChange={(e) => setAttr('color', e.target.value)}
                />
              </Col>
            </Row>
            <Row align="middle">
              <Col span={10}>Primary Thickness</Col>
              <Col span={10}>
                <Slider
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={attrs.thickness}
                  onChange={(val: number) => setAttr('thickness', val)}
                />
              </Col>
              <Col span={2}>
                <div className="result">{attrs.thickness.toFixed(1)}</div>
              </Col>
            </Row>
            <Row align="middle">
              <Col span={10}>Secondary Color</Col>
              <Col span={12}>
                <Input
                  type="color"
                  value={attrs.colorSecond}
                  style={{ width: '100%' }}
                  onChange={(e) => setAttr('colorSecond', e.target.value)}
                />
              </Col>
            </Row>
            <Row align="middle">
              <Col span={10}>Secondary Thickness</Col>
              <Col span={10}>
                <Slider
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={attrs.thicknessSecond}
                  onChange={(val: number) => setAttr('thicknessSecond', val)}
                />
              </Col>
              <Col span={2}>
                <div className="result">{attrs.thicknessSecond.toFixed(1)}</div>
              </Col>
            </Row>
            <Row align="middle">
              <Col span={10}>Scale Factor</Col>
              <Col span={10}>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={attrs.factor}
                  onChange={(val: number) => setAttr('factor', val)}
                />
              </Col>
              <Col span={2}>
                <div className="result">{attrs.factor}</div>
              </Col>
            </Row>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Row align="middle">
              <Col span={10}>Grid Color</Col>
              <Col span={12}>
                <Input
                  type="color"
                  value={attrs.color}
                  style={{ width: '100%' }}
                  onChange={(e) => setAttr('color', e.target.value)}
                />
              </Col>
            </Row>
            <Row align="middle">
              <Col span={10}>Thickness</Col>
              <Col span={11}>
                <Slider
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={attrs.thickness}
                  onChange={(val: number) => setAttr('thickness', val)}
                />
              </Col>
              <Col span={1}>
                <div className="result">{attrs.thickness.toFixed(1)}</div>
              </Col>
            </Row>
          </React.Fragment>
        )}
      </TabPane>
      <TabPane tab="背景" key="2">
        <Row align="middle">
          <Col span={6}>Color</Col>
          <Col span={14}>
            <Input
              type="color"
              value={attrs.bgColor}
              style={{ width: '100%' }}
              onChange={(e) => setAttr('bgColor', e.target.value)}
            />
          </Col>
        </Row>
        <Row align="middle">
          <Col span={14} offset={6}>
            <Checkbox
              checked={attrs.showImage}
              onChange={(e) => setAttr('showImage', e.target.checked)}
            >
              Show Image
            </Checkbox>
          </Col>
        </Row>
        {attrs.showImage && (
          <React.Fragment>
            <Row align="middle">
              <Col span={6}>Repeat</Col>
              <Col span={14}>
                <Select
                  style={{ width: '100%' }}
                  value={attrs.repeat}
                  onChange={(val) => setAttr('repeat', val)}
                >
                  <Select.Option value={REPEAT_TYPE.NO_REPEAT}>
                    No Repeat
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.REPEAT}>
                    Repeat
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.REPEAT_X}>
                    Repeat X
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.REPEAT_Y}>
                    Repeat Y
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.ROUND}>Round</Select.Option>
                  <Select.Option value={REPEAT_TYPE.SPACE}>Space</Select.Option>
                  <Select.Option value={REPEAT_TYPE.FLIPX}>
                    Flip X
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.FLIPY}>
                    Flip Y
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.FLIPXY}>
                    Flip XY
                  </Select.Option>
                  <Select.Option value={REPEAT_TYPE.WATERMARK}>
                    Watermark
                  </Select.Option>
                </Select>
              </Col>
            </Row>
            {attrs.repeat === 'watermark' && (
              <Row align="middle">
                <Col span={16} offset={6} style={{ fontSize: 12 }}>
                  Watermark Angle
                </Col>
                <Col span={14} offset={6}>
                  <Slider
                    min={0}
                    max={360}
                    step={1}
                    value={attrs.angle}
                    onChange={(val: number) => setAttr('angle', val)}
                  />
                </Col>
                <Col span={2}>
                  <div className="result">{attrs.angle}</div>
                </Col>
              </Row>
            )}
            <Row align="middle">
              <Col span={6}>Position</Col>
              <Col span={14}>
                <Select
                  style={{ width: '100%' }}
                  value={attrs.position}
                  onChange={(val) => setAttr('position', val)}
                >
                  <Select.Option value="center">center</Select.Option>
                  <Select.Option value="left">left</Select.Option>
                  <Select.Option value="right">right</Select.Option>
                  <Select.Option value="top">top</Select.Option>
                  <Select.Option value="bottom">bottom</Select.Option>
                  <Select.Option value="50px 50px">50px 50px</Select.Option>
                  <Select.Option value={JSON.stringify({ x: 50, y: 50 })}>
                    {`{ x: 50, y: 50 }`}
                  </Select.Option>
                </Select>
              </Col>
            </Row>
            <Row align="middle">
              <Col span={6}>Size</Col>
              <Col span={14}>
                <Select
                  style={{ width: '100%' }}
                  value={attrs.bgSize}
                  onChange={(val) => setAttr('bgSize', val)}
                >
                  <Select.Option value="auto auto">auto auto</Select.Option>
                  <Select.Option value="cover">cover</Select.Option>
                  <Select.Option value="contain">contain</Select.Option>
                  <Select.Option value="30px 30px">30px 30px</Select.Option>
                  <Select.Option value="100% 100%">100% 100%</Select.Option>
                  <Select.Option
                    value={JSON.stringify({ width: 50, height: 50 })}
                  >
                    {`{width: 50, height: 50 }`}
                  </Select.Option>
                </Select>
              </Col>
            </Row>
            <Row align="middle">
              <Col span={6}>Opacity</Col>
              <Col span={12}>
                <Slider
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={attrs.opacity}
                  onChange={(val: number) => setAttr('opacity', val)}
                />
              </Col>
              <Col span={4}>
                <div className="result">{attrs.opacity.toFixed(2)}</div>
              </Col>
            </Row>
          </React.Fragment>
        )}
      </TabPane>
    </Tabs>
  )
}
