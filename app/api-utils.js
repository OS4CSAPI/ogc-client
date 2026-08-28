import API from './data/api.json';

export function formatFunctionToString(functionObj) {
  const params = (functionObj?.signatures?.[0]?.parameters || [])
    .map(
      (param) =>
        `${param.flags?.isRest ? '...' : ''}${param.name}${
          param.flags?.optional ? '?' : ''
        }: ${formatTypeToString(param.type)}`,
    )
    .join(', ');
  let typeParams = '';
  if (functionObj?.signatures?.[0]?.typeParameter?.length) {
    typeParams = `&lt;${functionObj.signatures[0].typeParameter
      .map((t) => t.name)
      .join(', ')}&gt;`;
  }
  return `${functionObj.name}${typeParams}(${params})`;
}

export function formatConstructorToString(classObj, functionObj) {
  const params = (functionObj?.signatures?.[0]?.parameters || [])
    .map(
      (param) =>
        `${param.flags?.isRest ? '...' : ''}${param.name}: ${formatTypeToString(
          param.type,
        )}`,
    )
    .join(', ');
  return `new ${classObj.name}(${params})`;
}

export function formatTypeToString(typeObj) {
  if (!typeObj) return 'void';
  if (typeObj.type === 'array') {
    return `${formatTypeToString(typeObj.elementType)}[]`;
  }
  if (typeObj.type === 'union') {
    return typeObj.types.map(formatTypeToString).join(' | ');
  }
  if (typeObj.type === 'intersection') {
    return typeObj.types.map(formatTypeToString).join(' & ');
  }
  if (typeObj.type === 'literal') {
    return `'${typeObj.value}'`;
  }
  if (
    typeObj.type === 'reflection' &&
    typeObj.declaration?.signatures?.length
  ) {
    const returnType = typeObj.declaration?.signatures?.[0]?.type;
    return `() => ${formatTypeToString(returnType)}`;
  }
  if (
    typeObj.type === 'reflection' &&
    typeObj.declaration?.kind & 65536 // ReflectionKind.TypeLiteral
  ) {
    const properties = typeObj.declaration?.children
      ?.map((propEl) => {
        return `${propEl.name}: ${formatTypeToString(propEl.type)}`;
      })
      .join(', ');
    return `{ ${properties} }`;
  }
  if (typeObj.type === 'reference') {
    switch (typeObj.name) {
      case 'Record':
        return `Record\\<${formatTypeToString(
          typeObj.typeArguments[0],
        )}, ${formatTypeToString(typeObj.typeArguments[1])}\\>`;
      case 'Response':
        return `[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)`;
      case 'Error':
        return `[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)`;
      case 'Promise':
        // we include a zero-width space after the opening < have more readable line breaks (https://en.wikipedia.org/wiki/Zero-width_space)
        return `[Promise](https://developer.mozilla.org/en-US/docs/Web/API/Promise)&lt;<wbr>${formatTypeToString(
          typeObj.typeArguments[0],
        )}<wbr>&gt;`;
      case 'Omit':
        return formatTypeToString(typeObj.typeArguments[0]);
    }
    const ref = API.children.find((el) => el.id === typeObj.target);
    if (ref) {
      return `[${ref.name}](/api#type-${ref.name})`;
    }
    return typeObj.name;
  }
  if (typeObj.type === 'query') {
    const ref = API.children.find((el) => el.id === typeObj.queryType.target);
    if (ref) {
      return ref;
    }
    return typeObj.queryType.name;
  }
  if (typeObj.type === 'indexedAccess') {
    return `${formatTypeToString(typeObj.objectType)}[${formatTypeToString(
      typeObj.indexType,
    )}]`;
  }
  if (typeObj.type === 'tuple') {
    return `[${typeObj.elements.map(formatTypeToString).join(', ')}]`;
  }
  return typeObj.name;
}

export function getDescription(obj) {
  return (
    obj?.getSignature?.comment?.summary ||
    obj?.signatures?.[0]?.comment?.summary ||
    obj?.comment?.summary
  )
    ?.map((s) => s.text)
    .join('');
}

export function getReturnDescription(obj) {
  const returnBlock = obj?.signatures?.[0]?.comment?.blockTags?.find(
    (block) => block.tag === '@returns',
  );
  return returnBlock?.content?.map((c) => c.text).join(', ') ?? null;
}
