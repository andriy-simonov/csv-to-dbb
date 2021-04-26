import transform from 'stream-transform';

// placeholder transformation function
export const rotateColumns: transform.Handler<Array<string>, void> = function(data: Array<string>, callback: transform.HandlerCallback) {
  setImmediate(function() {
    data.push(data.shift()!);
    callback(null, data);
  });
};