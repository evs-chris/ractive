import { REFERENCE } from 'config/types';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';

var MemberResolver = function ( template, resolver, parentFragment ) {
	this.resolver = resolver;
	this.root = resolver.root;
	this.parentFragment = parentFragment;

	if ( typeof template === 'string' ) {
		this.value = template;
	}

	// Simple reference?
	else if ( template.t === REFERENCE ) {
		this.refResolver = createReferenceResolver( this, template.n, keypath => {
			this.resolve( keypath );
		});
	}

	// Otherwise we have an expression in its own right
	else {
		new ExpressionResolver( resolver, parentFragment, template, keypath => {
			this.resolve( keypath );
		});
	}
};

MemberResolver.prototype = {
	resolve: function ( keypath ) {
		if ( this.keypath ) {
			this.keypath.unregister( this );
		}

		this.keypath = keypath;
		this.value = keypath.get();

		this.bind();

		this.resolver.bubble();
	},

	bind: function () {
		this.keypath.register( this );
	},

	rebind: function ( oldKeypath, newKeypath ) {
		if ( this.refResolver ) {
			this.refResolver.rebind( oldKeypath, newKeypath );
		}
	},

	setValue: function ( value ) {
		this.value = value;
		this.resolver.bubble();
	},

	unbind: function () {
		if ( this.keypath ) {
			this.keypath.unregister( this );
		}

		if ( this.refResolver ) {
			this.refResolver.unbind();
		}
	},

	forceResolution: function () {
		if ( this.refResolver ) {
			this.refResolver.forceResolution();
		}
	}
};

export default MemberResolver;
