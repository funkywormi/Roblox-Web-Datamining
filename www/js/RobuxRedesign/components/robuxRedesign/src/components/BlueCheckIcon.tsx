import blueCheckImage from "../images/icons/blue_check_12x12.svg";

export function BlueCheckIcon({ size }: { size: number }) {
  return <img src={blueCheckImage} alt="blue check icon" style={{ width: size, height: size }} />;
}
