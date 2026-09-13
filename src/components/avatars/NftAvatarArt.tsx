import {
  selectAvatarTraits,
  type NftAvatarSelection,
} from "@/lib/nftAvatar";

/** Renders one assembled NFT trait stack on the shared 96x96 canvas. */
export function NftAvatarArt({
  selection,
  className,
}: {
  selection: NftAvatarSelection;
  className?: string;
}) {
  const { palette, traits } = selection;
  const uid =
    selection.seed.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "df";
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      {traits.background.render(palette, uid)}
      {traits.clothing.render(palette, uid)}
      {traits.head.render(palette, uid)}
      {traits.mouth.render(palette, uid)}
      {traits.eyes.render(palette, uid)}
      {traits.headwear.render(palette, uid)}
      {traits.accessories.render(palette, uid)}
      {traits.extras.render(palette, uid)}
    </svg>
  );
}

/** Deterministic NFT avatar for any seed (username, id, random reroll). */
export function NftAvatarSeedArt({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  return <NftAvatarArt selection={selectAvatarTraits(seed)} className={className} />;
}
