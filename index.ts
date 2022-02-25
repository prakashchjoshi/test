validators.service.ts

return this.getResponseBodyValidatorList(delRequestList);

getResponseBodyValidatorList(delRequestList): SbDocumentBodyValidator[] {

{
        name: 'deleteKey',
        calc: 'deleteKey',
        hasError: false,
        description: 'Soft delete & Hard delete',
        fields: [
          this.vfc.getDeleteTypeConfig('Field Name'),
          this.vfc.headingConfig('Soft delete dependency update'),
          this.vfc.getDatabaseFieldsRepeter('Add more field', delRequestList)
        ]
      }
      
   validate-field-config-service.ts   
      
      getDeleteTypeConfig(placeHolder: string): FormlyFieldConfig {
    return {
      key: 'deleteType',
      type: 'radio',
      templateOptions: {
        label: 'Selete delete type',
        placeholder: placeHolder,
        required: true,
        options: [
          {value: 'hard', label: "Hard Delete"},
          {value: 'soft', label: "Soft Delete"}
        ]
      }
    }
  }
  
  getDeleteFieldPathConfig(placeHolder: string, delRequestList: any): FormlyFieldConfig {
    return {
      key: 'fieldDeletePath',
      type: 'select',
      templateOptions: {
        label: 'Delete Path',
        placeholder: placeHolder,
        options: delRequestList,
        required: true
      },
      expressionProperties: {
        'model.deleteValues': (model: any, formState: any, field: FormlyFieldConfig) => {
          // access to the main model can be through `this.model` or `formState` or `model
          let index = field.templateOptions.options.findIndex((e)=>e.value==model.fieldDeletePath);
          return index > -1 ? field.templateOptions.options[index].example : "";
        },
      }
    };
  }
  
  getDeleteValueConfig(placeHolder: string): FormlyFieldConfig {
    return {
      key: 'deleteValues',
      type: 'input',
      templateOptions: {
        label: 'Values',
        placeholder: placeHolder,
        required: true,
      }
    };
  }

  headingConfig(label: string): FormlyFieldConfig {
    return {
      template: `<div><strong>${label}</strong></div>`,
      hideExpression: (m, formState, field) => {
        return m.deleteType != 'soft';
      }
    };
  }

  getDatabaseFieldsRepeter(placeHolder: string, delRequestList: any): FormlyFieldConfig {
    return {
      fieldGroup: [{
        key: 'databaseFieldRepeater',
        type: 'repeat',
        fieldArray: {
          templateOptions: {
            btnText: placeHolder,
          },
          fieldGroup: [
            this.getDeleteFieldPathConfig('Select database field', delRequestList),
            this.getDeleteValueConfig('Values')
          ]
        },
      }],
      hideExpression: (m, formState, field) => {
        return m.deleteType != 'soft';
      }
    }
  }
  
  repeat-section.type.ts
  
  import { Component } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  template: `
    <div *ngFor="let field of field.fieldGroup; let i = index">
      <formly-group
        [model]="model"
        [field]="field"
        [options]="options"
        [form]="formControl"
      >
        <div class="col-sm-2 d-flex align-items-center">
          <button class="btn btn-danger" type="button" (click)="remove(i)">
            Remove
          </button>
        </div>
      </formly-group>
    </div>
    <div style="margin:30px 0;">
      <button class="btn btn-primary" type="button" (click)="add()">
        {{ field.fieldArray.templateOptions.btnText }}
      </button>
    </div>
  `
})
export class RepeatTypeComponent extends FieldArrayType {
  constructor(builder: FormlyFormBuilder) {
    super(builder);
  }
}

  
  editor-rule-model.component.ts
  
  openModal(successCallback = (_res: any) => {}, data:any) {
    this.editorForm = new FormGroup({});
    this.options= {};
    this.model= {
      databaseFieldRepeater:[{}]
    };
    
    api-body.component.ts
    
    public openHeaderModal(bodyItem: SbDocumentBodyItem): void {
    //console.log("body", bodyItem);
    //console.log("itemInfo", this.type);
    const data = {
      selected: bodyItem.validators,
      item: bodyItem,
      validatorType: this.type == 'response' ? 'responseBody' :'body',
      delRequestList: this.delRequestList
    };
    this.modalsService.addHeaderRuleModalComponent.openModal((res) => {
      this.openEditorDialog(bodyItem, res);
    }, data);
  }
  
  add-header-rule-modal.component.ts
  
  openModal(successCallback = (_res: any) => {}, data:any) {
    this.successCallback = successCallback;
    this.selected = data.selected;
    console.log(data);
    this.validatorType = data.validatorType;
    const allValidators: SbDocumentHeaderValidator[] = this.vs.getValidatorList(this.validatorType, data.options, data.delRequestList);
    this.validatorList = [];
    for (const item of allValidators) {
      if (this.selected.findIndex(val  => val.name === item.name) === -1 && this.selected.findIndex(val  => val.name === item.optional) === -1) {
        this.validatorList.push(item);
      }
    }
    this.addHeaderRuleModal.show();
  }
  
  open-banking-component.ts
  
   else if (validator.name == "percentofAmount") {
              let obj: any = {};
              obj.calc = "percentofAmount";
              obj.keyFieldName = field;
              obj.values = validator.errorResponse.values.split(',');
              obj.postRequestPath = validator.errorResponse.fieldPostPath;
              obj.values = obj.values.map((val)=>{
                let arr = val.split(':');
                if (arr && arr.length > 1) {
                  let obj: any = {};
                  obj[arr[0].trim()] = arr[1].trim();
                  return obj;
                } else {
                  return val.trim();
                }
              });
              dataObject[namePath].database.dbWriteMissingData.push(obj);
            } else if(validator.name == "deleteKey") {
              dataObject[namePath].database.mappings[field]['deleteType'] = validator.errorResponse.deleteType;
              let fileName = this.getFileName(pathObj['name'].replace('GET', 'DELETE'), true);
              dataObject[namePath].database.mappings[field][`deleteResponsePath(lib/config/${fileName})`] = '$.' + payload.fullPath;
              if (validator.errorResponse.databaseFieldRepeater && validator.errorResponse.databaseFieldRepeater.length) {
                dataObject[namePath].database.mappings[field]['softDeleteDependencyUpdate'] = [];
                for(let depndency of validator.errorResponse.databaseFieldRepeater) {
                  let obj = {
                    "updateDatabaseField": depndency.fieldDeletePath,
                    "value": depndency.deleteValues
                  }
                  dataObject[namePath].database.mappings[field]['softDeleteDependencyUpdate'].push(obj);
                }
              }
              console.log("deletekey", dataObject);
            } 
            
            
            getRequestPathForDelete () {
    const paths = this.returnSpec.paths;
    for (const [pathName, pathObj] of Object.entries(paths)) {
      if (pathObj.method == "DELETE" && pathObj.responseSchema && pathObj.responseSchema.length) {
        for (let payload of pathObj.responseSchema) {
          this.delRequestList.push({
            value: payload.fullPath,
            example: payload.coreObj.example,
            label: payload.fullPath
          });
        }
      }
    }
  }
  
