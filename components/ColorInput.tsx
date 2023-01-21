import { Checkbox, Form, Input, InputRef, Popover } from 'antd';
import cx from 'classnames';
import React from 'react';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';

const Item = Form.Item;

const rgba2hex = (rgba) => {
  const t = tinycolor(rgba);
  if (rgba.a === 1) return t.toHexString();
  return t.toHex8String();
};

export const ColorInput = ({
  value,
  onChange,
  disabled,
  open,
  setOpen,
  ...props
}: React.ComponentProps<typeof Input> & {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) => {
  return (
    <Popover
      content={
        <SketchPicker
          color={value}
          onChange={(color) => onChange(rgba2hex(color.rgb))}
        />
      }
      open={open}
      onOpenChange={setOpen}
    >
      <Input
        value={value}
        onChange={onChange}
        suffix={
          <div
            style={{
              backgroundColor: value,
              height: 18,
              width: 18,
              display: disabled || !value ? 'none' : 'block',
            }}
            className="mr-1 rounded-full dark:border-white/60 border-black/60 border"
          />
        }
        disabled={disabled}
        {...props}
      />
    </Popover>
  );
};
export const ColorInputItem = ({
  invalidMessage,
  enabled,
  setEnabled,
  children,
  label,
  ...props
}: React.ComponentProps<typeof Item> & {
  invalidMessage?: string;
  enabled?: boolean;
  setEnabled?: (enabled: boolean) => void;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Item
      {...props}
      rules={[
        {
          validator: (rule, value) => {
            if (tinycolor(value).isValid()) return Promise.resolve();
            return Promise.reject(rule.message);
          },
          message: invalidMessage,
        },
      ]}
      label={
        <Checkbox
          className="flex-row-reverse"
          checked={enabled}
          onChange={(e) => {
            setOpen(e.target.checked);
            setEnabled(e.target.checked);
          }}
        >
          <div
            className={cx('flex items-center gap-2 absolute left-0 top-0', {
              'opacity-40 hover:opacity-80 active:opacity-100 transition-all ease-in-out':
                !enabled,
            })}
          >
            {label ?? children}
          </div>
        </Checkbox>
      }
    >
      <ColorInput disabled={!enabled} open={open} setOpen={setOpen} />
    </Item>
  );
};
