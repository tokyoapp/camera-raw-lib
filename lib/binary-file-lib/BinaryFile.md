# A Library to read binary files in JS

## Example

```javascript
import { BinaryFile } from '../lib/binary-file-lib/files/BinaryFile';

// file structure defined by data types
const FileHeader = {
    magic: 'char[4]'
}

class SomeBinaryFile extends BinaryFile {

    static parseFile(file) {
        // read file header
        file.header = this.unserialize(file, 0, FileHeader);
    }

    toString() {
        // get value from file header
        return BinaryFile.getValue(file.header, 'magic');
    }

}

function main(filename) {
    const fileBuffer = fs.readFileSync(path.resolve(filename));

    // create instance of file
    const file = new SomeBinaryFile(fileBuffer.buffer);

    console.log(file.toString());
}

```

## Types

Types:

```javascript
{ key: 'type' }
```

Type arrays:
```javascript
{ key: 'type[n]' }
```

All types:

```javascript
{
    int: 'Int32'
    long: 'BigInt64'
    unsigned int: 'Uint32'
    float: 'Float32'
    short: 'Int16'
    unsigned short: 'Uint16'
    byte: 'Uint8'
    bool: 'Uint8'
    char: "ASCI Character"
    unsigned char: "ASCI Character String terminated by null"
}
```