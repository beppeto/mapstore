/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Class: MSMLogin
 * Extend an Ext.FormPanel, enable insert of username and password to access to resources of MapStoreManager
 * and abilitate edit and delete map
 * 
 * 
 * 
 * Inherits from:
 *  - <Ext.FormPanel>
 *
 */

MSMLogin = Ext.extend(Ext.FormPanel, {
    /**
     * Property: loginText
     * {string} string for label in login button
     * 
     */
    loginText: "Login",
    /**
     * Property: logoutText
     * {string} string for label in logout button
     * 
     */
    logoutText: "Logout",
    /**
     * Property: ruleText
     * {string} string with template to display user and its role
     * 
     */
    ruleText: "USER LOGGED: {user}",
    /**
     * Property: loginErrorText
     * {string} string to visualize if user enter invalid username and password
     * 
     */
    loginErrorText: "Invalid username or password.",
    /**
     * Property: loginErrorTitle
     * {string} title of form alert to visualize if user enter invalid username and password
     * 
     */
    loginErrorTitle: "Login failed.",
    /**
     * Property: userFieldText
     * {string} label for user in a form
     * 
     */
    userFieldText: "User",
    /**
     * Property: passwordFieldText
     * {string} label for password in a form
     * 
     */
    passwordFieldText: "Password", 
    /**
     * Property: loginFormTitle
     * {string} title of login form
     * 
     */
    loginFormTitle: 'Please Login',
    /**
     * Property: grid
     * {object} property grid to access GridPanel
     * 
     */
    grid: null,
    /**
     * Property: config
     * {object} object for configuring the component. See <config.js>
     * 
     */
    config: null, 
    /**
     * Property: labelWidth
     * {number} set width of label
     * 
     */
    labelWidth:80,
    /**
     * Property: frame
     * {boolean} set frame properties to true
     * 
     */
    frame:true, 
    /**
     * Property: defaultType
     * {string} set default type of form as testfield
     * 
     */
    defaultType:'textfield',

    initComponent : function() {
        
        Ext.apply(this, {  
            monitorValid:true,
            trackResetOnLoad : true,/*
            errorReader: {
                read: function(response) {
                    var success = false;
                    var records = [];
                    if (response.status === 200) {
                        success = true;
                    } else {
                        records = [
                            {data: {id: "loginUsername", msg: this.loginErrorText}},
                            {data: {id: "loginPassword", msg: this.loginErrorText}}
                        ];
                    }
                    return {
                        success: success,
                        records: records
                    };
                }
            },*/
            items:[{  
                fieldLabel: this.userFieldText,
                name:'loginUsername', 
                allowBlank:false,
                listeners: {
                  beforeRender: function(field) {
                    field.focus(false, 1000);
                  }
                }
            },{  
                fieldLabel:this.passwordFieldText, 
                name:'loginPassword', 
                inputType:'password', 
                allowBlank:false
            }],
            buttons:[{ 
                text: this.loginText,
                iconCls: 'accept',
                formBind: true,
                scope: this,
                handler: this.submitLogin
            }],
            keys: [{ 
                key: [Ext.EventObject.ENTER],
                scope: this,
                handler: this.submitLogin
            }]
        }),
        
        this.loginButton = new Ext.Button({
            id: 'id_loginButton'            
        });
        
        this.userLabel = new Ext.form.Label({
            xtype: 'textfield',
            labelStyle: 'font-weight:bold;',
            cls: 'user-role-label'
        });
        
        this.showLogin();
        
        MSMLogin.superclass.initComponent.call(this, arguments);
    },
    /**
    * private: method[showLoginForm]
    * show the login form in a Ext.Window
    */ 
    showLoginForm: function() {
        var form = this.getForm();
        this.win = new Ext.Window({
            title: this.loginFormTitle,
            iconCls: 'user',
            layout: "fit",
            width: 275,
			closeAction: 'hide',
            height: 130,
            plain: true,
            border: false,
            modal: true,
            items: [this],
            listeners: {
                afterRender: function(){
                    form.clearInvalid();
                },
                hide: function(){
                    form.reset();
                }
            }
        });
        this.win.show();        
    },
    
    /** private: method[logout]
     *  Log out the current user from the application.
     */
    logout: function() {
	    // invalidate token
	    this.token = null;
	    this.userid = null;
	    this.username = null;
        this.grid.store.proxy.getConnection().defaultHeaders = {'Accept': 'application/json'};
        this.grid.getBottomToolbar().bindStore(this.grid.store, true);
        this.grid.getBottomToolbar().doRefresh();
        this.grid.plugins.collapseAll()
        this.grid.getBottomToolbar().openMapComposer.disable();
 		this.grid.openUserManagerButton.disable();
        this.showLogin();
    },

    /** 
     * api: method[getToken]
     * get the auth token for this session.
     */
	getToken: function(){
		return this.token;
	},

    /** 
     * api: method[getCurrentUser]
     * get the current user.
     */
	getCurrentUser: function(){
		return this.username;
	},
	
    /** 
     * api: method[isGuest]
     * verify if the current user is a guest.
     */
	isGuest: function(){
		return (this.username===undefined ||  this.username === null );
	},
		
    /** 
     * api: method[submitLogin]
     * Submits the login.
     */ 
    submitLogin: function () {
        
        var form = this.getForm();
        var fields = form.getValues();
        var pass = fields.loginPassword;
        var user = fields.loginUsername;
        var auth= 'Basic ' + Base64.encode(user+':'+pass);
        Ext.Ajax.request({
            method: 'GET',
            url: config.baseUrl + '/geostore/rest/users/user/details/',
            scope: this,
            headers: {
                'Accept': 'application/json',
                'Authorization' : auth
            },
            success: function(response, form, action) {
            
                this.win.hide();
                this.getForm().reset();
                
                var user = Ext.util.JSON.decode(response.responseText);
                
                this.showLogout(user.User.name);
				// save auth info
				this.token = auth;
				if (user.User) {
					this.userid = user.User.id;//TODO geostore don't return user id! in details request
					this.username = user.User.name;
					this.role = user.User.role;
				}
				this.grid.render();
                this.grid.store.proxy.getConnection().defaultHeaders = {'Accept': 'application/json', "Authorization": auth};                
                this.grid.getBottomToolbar().bindStore(this.grid.store, true);
                this.grid.getBottomToolbar().doRefresh();
                this.grid.plugins.collapseAll();
                this.grid.getBottomToolbar().openMapComposer.enable();
					this.grid.openUserManagerButton.enable();
            },
            failure: function(response, form, action) {
                Ext.MessageBox.show({
                    title: this.loginErrorTitle,
                    msg: this.loginErrorText,
                    buttons: Ext.MessageBox.OK,
                    animEl: 'mb4',
                    icon: Ext.MessageBox.WARNING
                });
                this.form.markInvalid({
                    "loginUsername": this.loginErrorText,
                    "loginPassword": this.loginErrorText
                });
            }
        });
    },

    /**
     * private: method[applyLoginState]
     * Attach a handler to the login button and set its text.
     */
    applyLoginState: function(iconCls, text, userLabel, handler, scope) {
        this.loginButton.setIconClass(iconCls);
        this.loginButton.setText(text);
        this.loginButton.setHandler(handler, scope);
        this.userLabel.setText(userLabel);
    },

    /** private: method[showLogin]
     *  Show the login button.
     */
    showLogin: function() {
        var text = this.loginText;
        var userLabel = '';
        var handler = this.showLoginForm;
        this.applyLoginState('login', text, userLabel, handler, this);
    },

    /** private: method[showLogout]
     *  Show the logout button.
     */
    showLogout: function(user, role) {
        var text = this.logoutText;
        var userLabel = new Ext.Template(this.ruleText).applyTemplate({user: user});
        var handler = this.logout;
        this.applyLoginState('logout', text, userLabel, handler, this);
    }
});
