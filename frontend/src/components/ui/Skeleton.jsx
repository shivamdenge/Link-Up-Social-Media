/**
 * Skeleton loaders for different content types.
 */
export function SkeletonText({ width = '100%', height = 14, style = {} }) {
  return (
    <div
      className="skeleton skeleton-text"
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonAvatar({ size = 48 }) {
  return (
    <div
      className="skeleton skeleton-avatar"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

export function SkeletonPostCard() {
  return (
    <div className="card" style={{ padding: '20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <SkeletonAvatar size={48} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText width="40%" />
          <SkeletonText width="60%" height={11} />
        </div>
      </div>
      <SkeletonText style={{ marginBottom: '8px' }} />
      <SkeletonText width="80%" style={{ marginBottom: '8px' }} />
      <SkeletonText width="60%" />
      <div style={{ height: '1px', background: '#e0dcd7', margin: '16px 0' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonText width="80px" height={32} style={{ borderRadius: '20px' }} />
        <SkeletonText width="80px" height={32} style={{ borderRadius: '20px' }} />
      </div>
    </div>
  );
}

export function SkeletonProfileCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 80 }} />
      <div style={{ padding: '0 16px 16px', marginTop: '-24px' }}>
        <SkeletonAvatar size={72} />
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText width="70%" />
          <SkeletonText width="90%" height={11} />
          <SkeletonText width="50%" height={11} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonConnectionCard() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
      <SkeletonAvatar size={48} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonText width="60%" />
        <SkeletonText width="80%" height={11} />
      </div>
      <SkeletonText width="80px" height={30} style={{ borderRadius: '20px' }} />
    </div>
  );
}
