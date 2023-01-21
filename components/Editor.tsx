import {
  Checkbox,
  Dropdown,
  Form,
  FormInstance,
  InputNumber,
  Layout,
} from 'antd';
import { useTranslation } from 'next-i18next';
import React, { createElement, SVGFactory, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { IoMdResize } from 'react-icons/io';
import { IoColorPalette, IoColorPaletteOutline } from 'react-icons/io5';
import {
  TbBorderRadius,
  TbBoxMargin,
  TbBoxPadding,
  TbTextResize,
} from 'react-icons/tb';
import { copySVGasPNG, svgToDataURI, svgToPNGBlob } from 'utils/svg';
import { getFirstCapitalizedWord } from 'utils/text';
import { ColorInputItem } from './ColorInput';
import TransparentGrid from './TransparentGrid';
import cx from 'classnames';

const { Header: header, Footer, Sider, Content } = Layout;
const Item = Form.Item;

const DEBUG = true;

interface IconProps {
  name: string;
  // url: string;
  color: string;
  background?: string;
  margin: string;
  padding: string;
  size: string;
  strokeWidth: string;
}

const defaultProps = {
  color: '#000000',
  background: '#ffffff',
  margin: '0',
  padding: '0',
  // size: '100%',
  strokeWidth: '1',
};

const COPY = {
  Name: 'Name',
  ReactImport: 'React Import',
  DataURI: 'Data URI',
  SVG: 'SVG',
  PNG: 'PNG',
} as const;

const DOWNLOAD = {
  SVG: 'SVG',
  PNG: 'PNG',
  ICO: 'ICO',
  React: 'React Component',
  Vue: 'Vue Component',
  Svelte: 'Svelte Component',
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
      <style>{`svg {height: ${svgSize}; width: ${svgSize};}`}</style>
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
      case COPY.ReactImport: {
        text = `import { ${name} } from "react-icons/${getFirstCapitalizedWord(
          name
        )}";`;
        break;
      }
      case COPY.PNG: {
        try {
          await copySVGasPNG(svgStr, form.getFieldValue('size'));
          return;
        } catch (err) {
          console.error(err);
          // message.error(t(`Copy failed`));
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied', type, text);
      // message.success(t('Copied') + ' ' + t(type));
    } catch (err) {
      console.error(err);
      // message.error(t(`Copy failed`));
    }
  };

  const downloadAs = async (type) => {
    const svgStr = getSvgString();
    const link = document.createElement('a');
    const size = form.getFieldValue('size');

    let objectUrl;

    let filename = name;
    switch (type) {
      case DOWNLOAD.SVG: {
        link.href = svgToDataURI(svgStr);
        filename += '.svg';
        break;
      }
      case DOWNLOAD.PNG: {
        const pngBlob = await svgToPNGBlob(svgStr, size);
        objectUrl = URL.createObjectURL(pngBlob);
        link.href = objectUrl;
        filename += '.png';
        break;
      }
      case DOWNLOAD.ICO: {
      }
    }

    link.download = filename;
    link.click();
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
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

            <Item
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
            </Item>
            <Item
              label={
                <div className="flex items-center gap-2">
                  <IoMdResize />
                  <span>{t('Size')}</span>
                </div>
              }
              name="size"
            >
              <InputNumber
                prefix={<TbTextResize />}
                addonAfter="px"
                step={4}
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
