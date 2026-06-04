export default {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-standard-scss',
        'stylelint-config-css-modules',
    ],
    rules: {
        // No named colors — always use CSS variables
        'color-named': 'never',

        // No !important
        'declaration-no-important': true,

        // Allow blank lines between property groups (common grouping pattern)
        'declaration-empty-line-before': null,

        // Don't require shorthand when longhand is clearer
        'declaration-block-no-redundant-longhand-properties': null,

        // Allow single-line keyframe blocks (common shorthand)
        'declaration-block-single-line-max-declarations': null,

        // Allow camelCase keyframe names (e.g. slideIn, fadeOut)
        'keyframes-name-pattern': null,

        // Vendor prefixes still needed for backdrop-filter etc.
        'property-no-vendor-prefix': null,

        // Allow more than 4 decimal places in calculated values
        'number-max-precision': null,
    },
    overrides: [
        // Component CSS Modules: enforce naming and unit conventions
        {
            files: ['src/**/*.module.{css,scss}'],
            rules: {
                // No px/em for font-size — use rem
                'declaration-property-unit-disallowed-list': {
                    'font-size': ['px', 'em'],
                },

                // PascalCase or camelCase class names (matches CSS Modules usage)
                'selector-class-pattern': '^[A-Za-z][a-zA-Z0-9]*$',
            },
        },
        // Global token files: hex color definitions are the source of truth here
        {
            files: ['src/colors_and_type.css', 'src/sizes.css'],
            rules: {
                'color-named': null,
                'declaration-property-unit-disallowed-list': null,
                'selector-class-pattern': null,
            },
        },
    ],
}
