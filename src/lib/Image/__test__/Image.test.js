
import React from 'react'
import ImageComponent from '..'
import { shallow, mount } from 'enzyme'
import {PreviewApi} from '../../ImgPreview'
import ErrorIcon from '../../ErrorIcon'
function getComp(prop) {
  return <ImageComponent src="test.png" {...prop}/>
}
describe('test img when IntersectionObserver is false', () => {
  it('Image set src prop', () => {
    const result = shallow(getComp())
    expect(result.find('img').prop('src')).toEqual('test.png')
    result.setProps({ src: 'test2.png' })
    expect(result.find('img').prop('src')).toEqual('test2.png')
  })
  it('test onClick', () => {
    const onClick = jest.fn().mockReturnValue(null)
    const result = shallow(getComp({onClick}))
    result.find('img').simulate('click')
    expect(onClick).toBeCalledTimes(1)
  })
  it('test onLoad, and LoadingIcon should hide', () => {
    const onLoad = jest.fn().mockReturnValue(null)
    const result = shallow(getComp({onLoad}))
    expect(result.instance().state.isLoading).toBe(true)
    result.find('img').simulate('load')
    expect(onLoad).toBeCalledTimes(1)
    expect(result.instance().state.isLoading).toBe(false)
    expect(result.instance().state.isError).toBe(false)
    expect(result.find('.mask-loading')).toHaveLength(0)
  })
  it('test onError, and ErrorIcon should show', () => {
    const onError = jest.fn().mockReturnValue(null)
    const result = shallow(getComp({onError}))
    expect(result.instance().state.isError).toBe(false)
    result.find('img').simulate('error')
    expect(onError).toBeCalledTimes(1)
    expect(result.instance().state.isError).toBe(true)
    expect(result.instance().state.isLoading).toBe(false)
    expect(result.find(ErrorIcon)).toHaveLength(1)
  })
  it('test delete', () => {
    const onDelete = jest.fn().mockReturnValue(null)
    const result = shallow(getComp({onDelete}))
    result.find('.react-image-icon').simulate('click')
    expect(onDelete).toBeCalledTimes(1)
  })
  it('test group & preview prop', () => {
    const group = '100'
    const result = shallow(getComp({group}))
    expect(result.find('.mask-img').prop('data-img-group')).toEqual('100')
  })
  it('data-index-group is "null" when preview is false', () => {
    const result = shallow(
      getComp({group: '100', preview: false})
    )
    expect(result.find('.mask-img').prop('data-img-group')).toEqual(null)
  })
  it('test className prop', () => {
    const className = 'test'
    const result = shallow(
      getComp({className})
    )
    expect(result.find('.mask-img').hasClass('test')).toBe(true)
  })
  it('test "style", "width" and "height" props', () => {
    const style = { background: 'red', testStyle: '1' }
    let result = shallow(
      getComp({width: 120, style})
    )
    expect(result.instance().style).toEqual({
      width: '120px',
      height: 'initial',
      background: 'red',
      testStyle: '1'
    })
    result = shallow(getComp({height: 100}))
    expect(result.instance().style).toEqual({
      width: '100px',
      height: '100px'
    })
  })
  it('test img style, style.display is "none" when "isLoading" or "isError" is true', () => {
    const imgStyle = { testImgStyle: 'test' }
    const result = shallow(
      getComp({
        imgProps: {style: imgStyle},
        objectFit: 'scale-down'
      })
    )
    const commonExpect = {
      objectFit: 'scale-down',
      testImgStyle: 'test'
    }
    expect(result.instance().imgStyle).toEqual({
      display: 'none',
      ...commonExpect
    })
    result.find('img').simulate('load')
    expect(result.instance().imgStyle).toEqual({
      display: '',
      ...commonExpect
    })
  })
  it('test img prop', () => {
    const imgProps = { 'data-index': 10 }
    const result = shallow(getComp({imgProps}))
    expect(result.find('img').prop('data-index')).toEqual(10)
  })
  it('test mask prop', () => {
    const mask = false
    const result = shallow(getComp({mask}))
    expect(result.find('.mask-img').hasClass('mask')).toBeFalsy()
  })
  it('test refDom', () => {
    const result = mount(<ImageComponent src="test.png" />)
    expect(result.instance().refDom.current).toBeTruthy()
  })
})

describe('test preview', () => {
  let preview,
    previewSrc,
    previewList
  beforeEach(() => {
    preview = jest.fn((src, list) => {
      previewSrc = src
      previewList = list
    })
    PreviewApi.preview = preview
  })
  it('preview trigger', () => {
    const wrapper = shallow(getComp())
    document.body.innerHTML = wrapper.html()
    wrapper.find('img').simulate('load').simulate('click')
    const dom = document.querySelectorAll(
      '.mask-img'
    )
    expect(preview).toBeCalledTimes(1)
    expect(previewSrc).toBe(wrapper.instance().props.src)
    expect(previewList).toEqual(Array.from(dom).map(each => each.dataset.imgSrc))
  })
  it('preview a group img', () => {
    const group = 'test'
    const wrapper = shallow(getComp({group, src: 'previewSrc'}))
    const wrapper1 = shallow(getComp({group: 'test1', src: 'test1.png'}))
    const wrapper2 = shallow(getComp({group, src: 'previewSrc2'}))
    document.body.innerHTML = wrapper.html() + wrapper1.html() + wrapper2.html()
    wrapper.find('img').simulate('load').simulate('click')
    expect(previewSrc).toBe(wrapper.instance().props.src)
    expect(previewList).toEqual(['previewSrc', 'previewSrc2'])
  })
  it('preview do not trigger when src is empty', () => {
    const wrapper = shallow(getComp({src: ''}))
    const ins = wrapper.instance()
    const img = wrapper.find('img')
    img.simulate('load')
    expect(ins.state.isLoading).toBe(false)
    expect(ins.state.isError).toBe(false)
    img.simulate('click')
    expect(preview).toBeCalledTimes(0)
  })
  it('preview do not trigger when isLoading is true', () => {
    const wrapper = shallow(getComp())
    wrapper.find('img').simulate('click')
    expect(preview).toBeCalledTimes(0)
  })
  it('preview do not trigger when isError is true', () => {
    const wrapper = shallow(getComp())
    wrapper.find('img').simulate('error')
    expect(wrapper.instance().state.isError).toBe(true)
    expect(wrapper.instance().state.isLoading).toBe(false)
    wrapper.find('img').simulate('click')
    expect(preview).toBeCalledTimes(0)
  })
})