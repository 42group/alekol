import { render, screen } from '@testing-library/react';

import Button, { ButtonProps } from './button';

describe('Button', () => {
  it.each<{ props: ButtonProps; text?: string }>([
    { props: {} },
    { props: { color: 'primary' } },
    { props: { color: 'secondary' } },
    { props: { color: 'discord' } },
    { props: { color: 'ft' } },
    { props: { color: 'primary', size: 'small' } },
    { props: { color: 'primary', size: 'large' } },
    { props: { color: 'secondary', size: 'small' } },
    { props: { color: 'secondary', size: 'large' } },
    { props: { color: 'discord', size: 'small' } },
    { props: { color: 'discord', size: 'large' } },
    { props: { color: 'ft', size: 'small' } },
    { props: { color: 'ft', size: 'large' } },
    { props: { color: 'primary', size: 'small', width: '300px' } },
    { props: { color: 'primary', size: 'large', width: '300px' } },
    { props: { color: 'secondary', size: 'small', width: '300px' } },
    { props: { color: 'secondary', size: 'large', width: '300px' } },
    { props: { color: 'discord', size: 'small', width: '300px' } },
    { props: { color: 'discord', size: 'large', width: '300px' } },
    { props: { color: 'ft', size: 'small', width: '300px' } },
    { props: { color: 'ft', size: 'large', width: '300px' } },
    {
      props: { color: 'primary', size: 'small', width: '300px' },
      text: 'Click me',
    },
    {
      props: { color: 'primary', size: 'large', width: '300px' },
      text: 'Click me',
    },
    {
      props: { color: 'secondary', size: 'small', width: '300px' },
      text: 'Click me',
    },
    {
      props: { color: 'secondary', size: 'large', width: '300px' },
      text: 'Click me',
    },
    {
      props: { color: 'discord', size: 'small', width: '300px' },
      text: 'Click me',
    },
    {
      props: { color: 'discord', size: 'large', width: '300px' },
      text: 'Click me',
    },
    { props: { color: 'ft', size: 'small', width: '300px' }, text: 'Click me' },
    { props: { color: 'ft', size: 'large', width: '300px' }, text: 'Click me' },
  ])(
    "should render successfully (props: $props, text: '$text')",
    ({ props, text }) => {
      render(<Button {...props}>{text}</Button>);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
      expect(buttonElement).toHaveClass('container');
      expect(buttonElement).toHaveClass(props.size || 'large');
      expect(buttonElement).toHaveClass(props.color || 'primary');
      expect(buttonElement).toHaveStyle({ width: props.width || 'auto' });
      expect(buttonElement.textContent).toEqual(text || 'Button');
    }
  );
});
