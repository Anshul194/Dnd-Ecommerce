export default function AnimatedGradientBorder({ align }) {
  return (
    <div className={`w-[200px] ${ align == "left" ? "" : "mx-auto" } p-[3px] rounded-xl bg-gradient-to-r from-green-300 via-green-500 to-green-700 animate-gradient-x bg-[length:200%_200%]`}>
    </div>
  );
}
