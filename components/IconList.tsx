import { Button, Empty, Menu, message, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineImport } from 'react-icons/ai';
import { BsCodeSlash, BsInputCursorText } from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import { useTranslation } from 'next-i18next';

const COPY = {
  IMPORT: 1,
  SVG: 2,
};
const columnWidth = 104 + 8;
const rowHeight = 80 + 8;
const padding = 4;

const getFirstCapitalizedWord = (str = '') =>
  str.match(/[A-Z][a-z]+/)[0].toLowerCase();

const IconButton = ({ onClick, onContextMenu, Icon, name, style }) => (
  <div
    style={{
      padding,
      ...style,
    }}
  >
    <Button
      onClick={() => onClick(name)}
      style={{
        height: rowHeight - padding * 2,
        width: '100%',
        whiteSpace: 'nowrap',
        padding,
      }}
      onContextMenu={(e) => {
        onContextMenu(e, name);
      }}
      id={name}
      className="icon-button"
    >
      <Icon />
      <Tooltip
        title={name}
        overlayInnerStyle={{
          fontSize: '0.75rem',
        }}
        placement="bottom"
      >
        <div
          style={{
            fontSize: '0.75rem',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
      </Tooltip>
    </Button>
  </div>
);

const getSvgByIconName = (name) => {
  const svg = document.querySelector(`#${name} > svg`).outerHTML;
  if (!svg) {
    return null;
  }
  return svg;
};

const ContextMenu = ({
  show,
  setShow,
  position: { x = 0, y = 0, xMax = 0, yMax = 0 },
  onClick,
}) => {
  const ref = useRef(null);
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      setShow(false);
      ref.current?.blur();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, setShow]);

  const pos: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } = {};
  if (x + 120 > xMax) {
    pos.right = xMax - x + 1;
  } else {
    pos.left = x - 12;
  }
  if (y + 200 > yMax) {
    pos.bottom = yMax - y + 30;
  } else {
    pos.top = y - 48;
  }

  return (
    <div ref={ref}>
      <Menu
        items={[
          {
            label: '复制 import',
            onClick: (e) => {
              onClick(show, COPY.IMPORT);
              (e.domEvent.target as HTMLElement)?.blur();
            },
            key: 'import',
            icon: <AiOutlineImport />,
          },
          {
            label: '复制 SVG',
            onClick: (e) => {
              onClick(show, COPY.SVG);
              (e.domEvent.target as HTMLElement)?.blur();
            },
            key: 'svg',
            icon: <BsCodeSlash />,
          },
          {
            label: '复制名称',
            onClick: (e) => {
              onClick(show);
              (e.domEvent.target as HTMLElement)?.blur();
            },
            key: 'name',
            icon: <BsInputCursorText />,
          },
          {
            label: '关闭菜单',
            onClick: (e) => {
              setShow(false);
              (e.domEvent.target as HTMLElement)?.blur();
            },
            key: 'close',
            icon: <CgClose />,
          },
        ]}
        style={{
          position: 'absolute',
          ...pos,
          zIndex: 9999,
          display: show ? 'block' : 'none',
        }}
      />
    </div>
  );
};
const IconListWrapper = ({ items = {}, style = {} }) => {
  const { t } = useTranslation('common');

  const list = Object.entries(items);

  if (!list?.length) {
    return (
      <Empty
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        description={t('No icons found')}
      />
    );
  }
  return <IconsList list={list} style={style} t={t} />;
};

const IconsList = ({ list, style, t }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
    xMax: 0,
    yMax: 0,
  });
  const onClick = useCallback((name, type = 0) => {
    name =
      type === COPY.IMPORT
        ? `import { ${name} } from "react-icons/${getFirstCapitalizedWord(
            name
          )}";`
        : type === COPY.SVG
        ? getSvgByIconName(name)
        : name;

    navigator.clipboard
      .writeText(name)
      .then(() => message.success(`${t('Copied')} ${name}`, 1.5))
      .catch(() => message.error(`${t('Copy Failed')} ${name}`, 1.5));
    setShowContextMenu(false);
  }, []);

  const onContextMenu = useCallback((e, name, { height, width }) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    setShowContextMenu(name);
    setContextMenuPosition({
      x: clientX,
      y: clientY,
      xMax: width,
      yMax: height,
    });
  }, []);

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style, data }) => {
      const index = rowIndex * data.columnCount + columnIndex;
      if (!data.list || index >= data.list.length) {
        return null;
      }
      const [name, Icon] = data.list?.[index];
      return (
        <IconButton
          onClick={onClick}
          Icon={Icon}
          name={name}
          style={style}
          onContextMenu={(e, name) =>
            onContextMenu(e, name, {
              height: data.height,
              width: data.width,
            })
          }
        />
      );
    },
    [onClick, onContextMenu]
  );

  return (
    <>
      <ContextMenu
        show={showContextMenu}
        setShow={setShowContextMenu}
        position={contextMenuPosition}
        onClick={onClick}
      />
      <AutoSizer
        style={{
          ...style,
        }}
      >
        {({ height, width }) => {
          const columnCount = Math.floor(width / columnWidth);
          const rowCount = Math.ceil(
            list.length / Math.floor(width / rowHeight)
          );
          return (
            <Grid
              columnCount={columnCount}
              columnWidth={width / columnCount}
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={width}
              itemData={{
                columnCount,
                rowCount,
                list,
                height,
                width,
              }}
              overscanRowCount={3}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </>
  );
};

export default IconListWrapper;
