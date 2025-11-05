// Buffer polyfill for browser
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
    window.Buffer = {
        isBuffer: function(obj) { 
            return obj && obj._isBuffer === true; 
        },
        alloc: function(size, fill, encoding) {
            var buf = new Uint8Array(size);
            buf._isBuffer = true;
            if (fill !== undefined) {
                buf.fill(fill);
            }
            return buf;
        },
        allocUnsafe: function(size) {
            var buf = new Uint8Array(size);
            buf._isBuffer = true;
            return buf;
        },
        from: function(data, encoding) {
            if (typeof data === 'string') {
                var encoder = new TextEncoder();
                var buf = encoder.encode(data);
                buf._isBuffer = true;
                return buf;
            } else if (Array.isArray(data) || data instanceof Uint8Array) {
                var buf = new Uint8Array(data);
                buf._isBuffer = true;
                return buf;
            }
            return data;
        }
    };
}
