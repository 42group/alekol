import { render } from '@testing-library/react';

import Switch, { SwitchProps } from './switch';

const mockHandleChange = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each<{ props: SwitchProps }>([
  { props: {} },
  { props: { checked: true } },
  { props: { checked: false } },
  { props: { handleChange: mockHandleChange } },
  { props: { checked: true, handleChange: mockHandleChange } },
  { props: { checked: false, handleChange: mockHandleChange } },
])('Switch (props: $props)', ({ props }) => {
  it('should render successfully', () => {
    const { baseElement } = render(<Switch {...props} />);
    expect(baseElement).toBeTruthy();
  });
  it('should generate a unique inputId', () => {
    const { getAllByRole } = render(
      <>
        <Switch />
        <Switch />
        <Switch />
      </>
    );

    const inputElements = getAllByRole('checkbox');
    const inputIds = inputElements.map((element) => element.getAttribute('id'));

    const uniqueInputIds = new Set(inputIds);

    expect(inputIds.length).toBe(3);
    expect(uniqueInputIds.size).toBe(3);
  });
  it('should pass the checked property to the input', () => {
    const { getByRole } = render(<Switch {...props} />);

    const inputElement = getByRole('checkbox') as HTMLInputElement;

    expect(inputElement.checked).toBe(props.checked || false);
  });
  it('should pass the handleChange property to the input', () => {
    const { getByRole } = render(<Switch {...props} />);

    const inputElement = getByRole('checkbox') as HTMLInputElement;
    inputElement.click();

    if (props.handleChange) expect(mockHandleChange).toHaveBeenCalled();
  });
});
