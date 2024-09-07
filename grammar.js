module.exports = grammar({
  name: 'msl',

  extras: $ => [
    /\s/,            // Whitespace
    $.comment        // Comments
  ],

  rules: {
    // The starting point of the grammar
    translation_unit: $ => repeat($._definition),

    _definition: $ => choice(
      $.function_definition,
      $.declaration,
      $.struct_definition,
      $.enum_definition
    ),

    // Function Definitions
    function_definition: $ => seq(
      $._type_specifier,
      $.identifier,
      $.parameter_list,
      optional($.attribute),
      $.compound_statement
    ),

    // Parameter List
    parameter_list: $ => seq(
      '(',
      optional(commaSep($.parameter_declaration)),
      ')'
    ),

    parameter_declaration: $ => seq(
      $._type_specifier,
      $.identifier,
      optional($.attribute)
    ),

    // Type Specifier
    _type_specifier: $ => choice(
      'void',
      'float',
      'float2',
      'float3',
      'float4',
      'float4x4',
      'int',
      'uint',
      'half',
      'half2',
      'half3',
      'half4',
      'bool',
      'texture2d',
      $.identifier // User-defined types
    ),

    // Struct Definitions
    struct_definition: $ => seq(
      'struct',
      $.identifier,
      '{',
      repeat($.struct_member),
      '}'
    ),

    struct_member: $ => seq(
      $._type_specifier,
      $.identifier,
      optional($.array_specifier),
      ';'
    ),

    array_specifier: $ => seq('[', $.integer_literal, ']'),

    // Enum Definitions
    enum_definition: $ => seq(
      'enum',
      $.identifier,
      ':',
      $.integer_type,
      '{',
      commaSep($.enumerator),
      '}'
    ),

    enumerator: $ => seq($.identifier, optional(seq('=', $.integer_literal))),

    integer_type: $ => choice('int', 'uint'),

    // Declarations
    declaration: $ => seq(
      $._type_specifier,
      $.identifier,
      optional($.array_specifier),
      optional(seq('=', $._expression)),
      ';'
    ),

    // Expressions
    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.function_call_expression,
      $.identifier,
      $.integer_literal,
      $.float_literal
    ),

    binary_expression: $ => prec.left(seq(
      $._expression,
      choice('+', '-', '*', '/', '%', '==', '!=', '<', '>', '<=', '>=', '&&', '||'),
      $._expression
    )),

    unary_expression: $ => prec.left(seq(
      choice('-', '!'),
      $._expression
    )),

    function_call_expression: $ => seq(
      $.identifier,
      $.argument_list
    ),

    argument_list: $ => seq(
      '(',
      optional(commaSep($._expression)),
      ')'
    ),

    // Statements
    compound_statement: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),

    _statement: $ => choice(
      $.declaration,
      $.expression_statement,
      $.return_statement,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.do_statement
    ),

    expression_statement: $ => seq($._expression, ';'),

    return_statement: $ => seq('return', optional($._expression), ';'),

    if_statement: $ => seq(
      'if', '(', $._expression, ')',
      $.compound_statement,
      optional(seq('else', $.compound_statement))
    ),

    for_statement: $ => seq(
      'for', '(', optional($.declaration), optional($._expression), ';', optional($._expression), ')',
      $.compound_statement
    ),

    while_statement: $ => seq(
      'while', '(', $._expression, ')',
      $.compound_statement
    ),

    do_statement: $ => seq(
      'do', $.compound_statement,
      'while', '(', $._expression, ')', ';'
    ),

    // Literals
    integer_literal: $ => /\d+/,

    float_literal: $ => /\d+\.\d+/,

    identifier: $ => /[a-zA-Z_]\w*/,

    // Comments
    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    )),

    // Attribute Syntax (MSL-specific)
    attribute: $ => seq('[[', $.identifier, optional(seq('(', $.identifier, ')')), ']]')
  }
});

// Helper function to handle comma-separated lists
function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule))));
}
