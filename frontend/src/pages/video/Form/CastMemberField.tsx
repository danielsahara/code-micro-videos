// @flow
import * as React from 'react';
import {MutableRefObject, RefAttributes, useCallback, useImperativeHandle, useRef} from 'react';
import castMemberHttp from "../../../util/http/cast-member-http";
import useHttpHandled from "../../../hooks/useHttpHandled";
import AsyncAutocomplete, {AsyncAutocompleteComponent} from "../../../components/AsyncAutocomplete";
import {FormControl, FormControlProps, FormHelperText, Typography} from "@material-ui/core";
import useCollectionManager from "../../../hooks/useCollectionManager";
import {GridSelectedItem} from "../../../components/GridSelectedItem";
import {GridSelected} from "../../../components/GridSelected";
import {ref} from "yup";

interface CastMemberFieldProps extends RefAttributes<CastMemberFieldProps>{
    castMembers: any[],
    setCastMembers: (castMembers) => void,
    error: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps;
};

export interface CastMemberFieldComponent {
    clear: () => void
}
export const CastMemberField = React.forwardRef<CastMemberFieldComponent, CastMemberFieldProps>((props, ref) => {
    const {castMembers, setCastMembers, error, disabled} = props;
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(castMembers, setCastMembers)
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;

    const fetchOptions = useCallback((searchText) =>{
        return autocompleteHttp(
            castMemberHttp.list({
                queryParams: {
                    search: searchText,
                    all: ""
                }
            })
        ).then(data => data.data)
    },[autocompleteHttp]);

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));

    return (
       <>
           <AsyncAutocomplete
               ref={autocompleteRef}
               fetchOptions={fetchOptions}
               AutocompleteProps={{
                   clearOnEscape: true,
                   freeSolo: true,
                   getOptionLabel: option => option.name,
                   getOptionSelected: (option, value) => option.id === value.id,
                   onChange: (event, value) => addItem(value),
               }}
               TextFieldProps={{
                   label: 'Elenco',
                   error: error !== undefined
               }}
           />
           <FormControl
               margin={"normal"}
               fullWidth
               error={error !== undefined}
               disabled={disabled !== undefined}
               {...props.FormControlProps}
           >
               <GridSelected>
                   {
                       castMembers.map((castMember, key) => (
                           <GridSelectedItem
                               key={key}
                               onDelete={() => {
                                   removeItem(castMember)
                               }}
                               xs={6}
                           >
                               <Typography noWrap={true}>{castMember.name}</Typography>
                           </GridSelectedItem>
                       ))
                   }
               </GridSelected>
               {
                   error && <FormHelperText>{error.message}</FormHelperText>
               }
           </FormControl>
       </>
    );
});

export default CastMemberField;