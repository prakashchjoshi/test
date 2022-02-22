getFieldParents (str) {
    let newStr= '';
    let list = str.split('.');
    if(list && list.length > 1) {
      newStr = list.reduce((prv, current)=>{
        let str = '';
        let preEle = this.getValue(this.responseNode, prv);
        if (Array.isArray(preEle)) {
          str = prv+'[0]';
        } else {
          str = prv;
        }
        let currEle = this.getValue(this.responseNode, prv+'.'+current);
        if (Array.isArray(currEle)) {
          str = str + '.' + current+ '[0]';
        } else {
          str = str + '.' + current;
        }
        return str;
      });
    }else {
      let ele = this.getValue(this.responseNode, str);
      if (Array.isArray(ele)) {
        newStr = str+'[0]';
      } else {
        newStr = str;
      }
    }

    return {getPath:str, setPath:newStr};
  }

  getValue (obj, key)  {
    const keyParts = key.split(".");
    return this.getValueHelper(obj, keyParts);
  };

  getValueHelper (obj, keyParts) {
    if (keyParts.length == 0) return obj;
    let key = keyParts.shift();
    if (Array.isArray(obj[key])) {
      return obj[key].map((x) => this.getValueHelper(x, [...keyParts])).flat();
    }
    return this.getValueHelper(obj[key], [...keyParts]);
  };

  setValue(obj, path, value) {
    let schema = obj;
    let keysList = path.split('.');
    let len = keysList.length;
    for (var i = 0; i < len - 1; i++) {
      let key = keysList[i];
      // checking if key represents an array element e.g. users[0]
      if (key.includes('[')) {
        //getting propertyName 'users' form key 'users[0]'
        let propertyName = key.substr(0, key.length - key.substr(key.indexOf("["), key.length - key.indexOf("[")).length);
        if (!schema[propertyName]) {
          schema[propertyName] = [];
        }
        // schema['users'][getting index 0 from 'users[0]']
        if (!schema[propertyName][parseInt(key.substr(key.indexOf("[") + 1, key.indexOf("]") - key.indexOf("[") - 1))]) {
          // if it doesn't exist create and initialise it
          schema = schema[propertyName][parseInt(key.substr(key.indexOf("[") + 1, key.indexOf("]") - key.indexOf("[") - 1))] = {};
        } else {
          schema = schema[propertyName][parseInt(key.substr(key.indexOf("[") + 1, key.indexOf("]") - key.indexOf("[") - 1))];
        }
        continue;
      }
      if (!schema[key]) {
        schema[key] = {};
      }
      schema = schema[key];
    } //loop ends
    // if last key is array element
    if (keysList[len - 1].includes('[')) {
      //getting propertyName 'users' form key 'users[0]'
      let propertyName = keysList[len - 1].substr(0, keysList[len - 1].length - keysList[len - 1].substr(keysList[len - 1].indexOf("["), keysList[len - 1].length - keysList[len - 1].indexOf("[")).length);
      if (!schema[propertyName]) {
        schema[propertyName] = [];
      }
      // schema[users][0] = value;
      schema[propertyName][parseInt(keysList[len - 1].substr(keysList[len - 1].indexOf("[") + 1, keysList[len - 1].indexOf("]") - keysList[len - 1].indexOf("[") - 1))] = value;
    } else {
      schema[keysList[len - 1]] = value;
    }
  }

  getResponseBody (obj:any, pathVal: string) {
    let temp = pathVal.split('.');
    let fieldValue = temp[temp.length - 1];
    let fieldParent = temp.slice(1, temp.length -1).join('.');
    switch (obj.type) {
      case 'object':
        if (fieldParent) {
          let fieldParents = fieldParent.split('.');
          if (fieldParent.indexOf('.') === -1) {
            this.responseNode[fieldParent][fieldValue] = {};
          }
        } else {
          if (fieldValue != "$") {
            this.responseNode = {...this.responseNode, [fieldValue]: {}};
          }
        }
        if (obj['properties']) {
          for (const [key, val] of Object.entries(obj['properties'])) {
            const newPathVal = pathVal + '.' + key;
            this.getResponseBody(val, newPathVal);
          }
        }
        break;
      case 'array':
        if (fieldParent) {
          if (Array.isArray(this.responseNode[fieldParent])) {
            if (this.responseNode[fieldParent].length) {
              this.responseNode[fieldParent][0][fieldValue] = [];
            } else {
              this.responseNode[fieldParent].push({[fieldValue]: []});
            }
          }
        } else {
          if (fieldValue != "$") {
            this.responseNode = {...this.responseNode, [fieldValue]: []};
          }
        }
        if (obj['items']['properties']) {
          for (const [key, val] of Object.entries(obj['items']['properties'])) {
            const newPathVal = pathVal + '.' + key;
            this.getResponseBody(val, newPathVal);
          }
        }else if (obj['items']['oneOf']){
          const newPathVal = pathVal;
          this.getResponseBody(obj['items']['oneOf'][0], newPathVal);
        }else if (obj['items']['anyOf']){
          const newPathVal = pathVal;
          this.getResponseBody(obj['items']['anyOf'][0], newPathVal);
        }else if (obj['items']) {
          for (const [key, val] of Object.entries(obj['items'])) {
            const newPathVal = pathVal + '.' + key;
            this.getResponseBody(val, newPathVal);
          }
          //const newPathVal = pathVal;
          //this.getResponseBody(obj['items'], newPathVal);
        }
        break;
      case 'string':
      case 'number':
      case 'boolean':
        fieldParent =  this.getFieldParents(fieldParent);
          if (fieldParent.getPath && fieldParent.setPath) {
            let result = this.getValue(this.responseNode, fieldParent.getPath);
            if (Array.isArray(result)) {
              this.setValue(this.responseNode, fieldParent.setPath+'.'+fieldValue, obj.example);
            } else {
              this.setValue(this.responseNode, fieldParent.setPath+'.'+fieldValue, obj.example);
            }
          } else {
            this.responseNode[fieldValue] = obj.example;
          }
        break;
      default:
        if (obj['properties']) {
          for (const [key, val] of Object.entries(obj['properties'])) {
            const newPathVal = pathVal + '.' + key;
            this.getResponseBody(val, newPathVal);
          }
        }
        break;
    }
  }
