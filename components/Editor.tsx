import { App, Dropdown, Form, FormInstance, InputNumber } from 'antd';
import { useTranslation } from 'next-i18next';
import React, { createElement, SVGFactory, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { IoMdResize } from 'react-icons/io';
import { IoColorPaletteOutline } from 'react-icons/io5';
import {
  TbBorderRadius,
  TbBoxMargin,
  TbBoxPadding,
  TbTextResize,
} from 'react-icons/tb';
import {
  copySVGasImage,
  svgToDataURI,
  svgToReactComponent,
  svgToCanvas,
  svgToIco,
} from 'utils/svg';
import { getFirstCapitalizedWord } from 'utils/text';
import { ColorInputItem } from './ColorInput';
import TransparentGrid from './TransparentGrid';
import { DraggableNumberInput } from './DraggableNumberInput';

const Item = Form.Item;

const DEBUG = true;

const defaultProps = {
  color: '#000000',
  background: '#ffffff',
  margin: '0',
  padding: '0',
  // size: '100%',
  strokeWidth: '1',
};

const COPY = {
  SVG: 'SVG',
  Name: 'Name',
  Import: 'Import',
  JSX: 'JSX',
  TSX: 'TSX',
  DataURI: 'Data URI',
  PNG: 'PNG',
} as const;

const DOWNLOAD = {
  SVG: 'SVG',
  PNG: 'PNG',
  JPG: 'JPG',
  ICO: 'ICO',
  ReactComponent: 'React Component (JSX)',
  ReactComponentTS: 'React Component (TSX)',
  // VueComponent: 'Vue Component',
  // SvelteComponent: 'Svelte Component',
} as const;

const IconRenderer = ({
  svg,
  form,
  colorEnabled,
  bgEnabled,
}: {
  svg: React.SVGFactory;
  form: FormInstance;
  colorEnabled: boolean;
  bgEnabled: boolean;
}) => {
  const color = Form.useWatch('color', form);
  const background = Form.useWatch('background', form);
  const margin = Form.useWatch('margin', form);
  const padding = Form.useWatch('padding', form);
  const size = Form.useWatch('size', form);
  const radius = Form.useWatch('radius', form);

  const style = {} as React.CSSProperties;

  if (margin && margin != 0) {
    style.margin = margin;
  }
  if (padding && padding != 0) {
    style.padding = padding;
  }
  if (size) {
    style.height = size;
    style.width = size;
  }
  if (radius) {
    style.borderRadius = radius;
  }
  if (bgEnabled && background) {
    style.backgroundColor = background;
  }

  const svgSize = size ?? '100%';

  const colors = colorEnabled ? { fill: color, stroke: color } : {};

  return (
    <main
      className="min-h-full flex-1 flex text-black overflow-hidden relative m-8 bg-white justify-center items-center"
      id="icon-renderer"
    >
      <style>{`#svg-container svg {height: ${svgSize}; width: ${svgSize};}`}</style>
      <TransparentGrid className="absolute z-0" />
      <div
        id="svg-container"
        className="z-10 h-full w-full flex justify-center items-center "
      >
        {createElement(svg, {
          ...colors,
          style,
        })}
      </div>
    </main>
  );
};

const Details = ({ name = 'FaUser', svg = FaUser as SVGFactory }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [bgEnabled, setBgEnabled] = useState(false);
  const [colorEnabled, setColorEnabled] = useState(false);

  const { t } = useTranslation('common');

  const getSvgString = () => {
    const icon = document
      .querySelector('#svg-container > svg')
      .cloneNode(true) as SVGElement;
    const svgStr = new XMLSerializer().serializeToString(icon);
    return svgStr;
  };

  const copyAs = async (type) => {
    const svgStr = getSvgString();
    let text = '';

    switch (type) {
      case COPY.SVG: {
        text = svgStr;
        break;
      }
      case COPY.DataURI: {
        text = svgToDataURI(svgStr);
        break;
      }
      case COPY.Name: {
        text = name;
        break;
      }
      case COPY.Import: {
        text = `import { ${name} } from "react-icons/${getFirstCapitalizedWord(
          name
        )}";`;
        break;
      }
      case COPY.PNG: {
        await copySVGasImage(svgStr, form.getFieldValue('size'));
      }
      case COPY.JSX: {
        text = await svgToReactComponent(svgStr, name);
        break;
      }
      case COPY.TSX: {
        text = await svgToReactComponent(svgStr, name, {
          typescript: true,
        });
        break;
      }
    }

    try {
      if (text) {
        await navigator.clipboard.writeText(text);
      }
      message.success(t('Copied') + ' ' + t(type));
    } catch (err) {
      console.error(err);
      message.error(t(`Copy failed`));
    }
  };

  const downloadAs = async (type) => {
    const svgStr = getSvgString();
    const link = document.createElement('a');
    const size = form.getFieldValue('size');

    let objectUrl;
    let filename = name;

    message.open({
      content: t('Downloading') + ' ' + t(type),
      key: 'download',
      duration: 0,
      type: 'loading',
    });

    try {
      switch (type) {
        case DOWNLOAD.SVG: {
          link.href = svgToDataURI(svgStr);
          filename += '.svg';
          break;
        }
        case DOWNLOAD.PNG: {
          const canvas = await svgToCanvas(svgStr, { size });
          objectUrl = canvas.toDataURL('image/png');
          link.href = objectUrl;
          filename += '.png';
          break;
        }
        case DOWNLOAD.JPG: {
          const canvas = await svgToCanvas(svgStr, {
            size,
            backgroundColor: 'white',
          });
          objectUrl = canvas.toDataURL('image/jpeg');
          link.href = objectUrl;
          filename += '.jpg';
          break;
        }
        // TODO: DOWNLOAD.ICO:
        // https://jsfiddle.net/vanowm/b657yksg/
        case DOWNLOAD.ICO: {
          objectUrl = await svgToIco(svgStr);
          link.href = objectUrl;
          filename += '.ico';
          break;
        }

        case DOWNLOAD.ReactComponent: {
          const component = await svgToReactComponent(svgStr, name, {
            importRuntime: true,
          });
          link.href =
            'data:text/plain;charset=utf-8,' + encodeURIComponent(component);
          filename += '.jsx';
          break;
        }
        case DOWNLOAD.ReactComponentTS: {
          const component = await svgToReactComponent(svgStr, name, {
            typescript: true,
            importRuntime: true,
          });
          link.href =
            'data:text/plain;charset=utf-8,' + encodeURIComponent(component);
          filename += '.tsx';
          break;
        }
        // case DOWNLOAD.VueComponent: {
        //   const component = await svgToVueComponent(svgStr, name);
        // }
      }

      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      message.open({
        content: t('Downloaded') + ' ' + filename,
        key: 'download',
        duration: 2,
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      message.error(t(`Download failed`));
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <header className="bg-gray-900">{name}</header>
      <div className="flex flex-row-reverse bg-gray-100/60 dark:bg-gray-800">
        <aside className="flex flex-0 bg-gray-100/60 dark:bg-gray-900 p-4 backdrop-blur-lg">
          <Form layout="vertical" form={form} initialValues={defaultProps}>
            <ColorInputItem
              name="color"
              enabled={colorEnabled}
              setEnabled={setColorEnabled}
              invalidMessage={t(`Invalid Color`)}
            >
              <IoColorPaletteOutline />
              {t('Color')}
            </ColorInputItem>
            <ColorInputItem
              name="background"
              enabled={bgEnabled}
              setEnabled={setBgEnabled}
              invalidMessage={t(`Invalid Color`)}
            >
              <IoColorPaletteOutline />
              {t('Background')}
            </ColorInputItem>
            {/* <DraggableNumberInputItem
              name="radius"
              icon={<TbBorderRadius />}
              label={t('Radius')}
              addonAfter="px"
            /> */}
            {/* <Item
              label={
                <div className="flex items-center gap-2">
                  <TbBorderRadius />
                  <span>{t('Radius')}</span>
                </div>
              }
              name="radius"
            >
              <InputNumber
                addonAfter="px"
                disabled={!bgEnabled}
                step={4}
                min={0}
              />
            </Item> */}
            {/* <DraggableNumberInputItem
              name="size"
              icon={<IoMdResize />}
              label={t('Size')}
              addonAfter="px"
            /> */}
            <Item
              label={
                <div className="flex items-center gap-2">
                  <IoMdResize />
                  <span>{t('Size')}</span>
                </div>
              }
              name="size"
            >
              <DraggableNumberInput
                // prefix={<TbTextResize />}
                addonAfter="px"
                min={0}
              />
            </Item>
            <Item
              label={
                <div className="flex items-center gap-2">
                  <TbBoxPadding />
                  <span>{t('Padding')}</span>
                </div>
              }
              name="padding"
            >
              <InputNumber addonAfter="px" step={4} />
            </Item>
            <Item
              label={
                <div className="flex items-center gap-2">
                  <TbBoxMargin />
                  <span>{t('Margin')}</span>
                </div>
              }
              name="margin"
            >
              <InputNumber addonAfter="px" step={4} />
            </Item>
            <div className="flex gap-2">
              <Dropdown.Button
                type="primary"
                menu={{
                  items: Object.values(COPY).map((key) => ({
                    label: t(key),
                    key,
                  })),
                  onClick: ({ key }) => copyAs(key),
                }}
                onClick={() => copyAs(COPY.SVG)}
              >
                {t('Copy')}
              </Dropdown.Button>
              <Dropdown.Button
                type="primary"
                menu={{
                  items: Object.values(DOWNLOAD).map((key) => ({
                    label: t(key),
                    key,
                  })),
                  onClick: ({ key }) => downloadAs(key),
                }}
                onClick={() => downloadAs(DOWNLOAD.SVG)}
              >
                {t('Download')}
              </Dropdown.Button>
            </div>
          </Form>
        </aside>
        <IconRenderer
          svg={svg}
          form={form}
          bgEnabled={bgEnabled}
          colorEnabled={colorEnabled}
        />
      </div>
      <footer>Footer</footer>
    </div>
  );
};

export default Details;
