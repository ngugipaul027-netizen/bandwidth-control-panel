{include file="sections/header.tpl"}
<style>
.content-wrapper, .content { background: #f4f6f9 !important; }
.dark-mode .content-wrapper, .dark-mode .content { background: #0f1724 !important; }
.content-header { display: none; }
.im-page {
    --bg: #131d2c; --panel: #1a2536; --panel-2: #202d40; --input: #0f1826;
    --line: #2a384c; --line-soft: #233044;
    --text: #e6edf6; --text-2: #b8c4d4; --muted: #8392a7;
    --brand: #f97316; --brand-soft: rgba(249,115,22,.14); --brand-text: #fdba74;
    --green: #22c55e; --green-soft: rgba(34,197,94,.14); --green-text: #86efac;
    --red: #ef4444; --red-soft: rgba(239,68,68,.14); --red-text: #fca5a5;
    --grey-soft: rgba(148,163,184,.14); --grey-text: #cbd5e1;
    --blue-soft: rgba(56,189,248,.14); --blue-text: #7dd3fc;
    color: var(--text); font-family: Inter, "Segoe UI", system-ui, sans-serif;
}
html:not(.dark-mode) .im-page {
    --bg: #ffffff; --panel: #ffffff; --panel-2: #f8fafc; --input: #ffffff;
    --line: #e2e8f0; --line-soft: #edf1f6;
    --text: #0f172a; --text-2: #334155; --muted: #64748b;
    --brand-soft: #fff1e6; --brand-text: #c2410c;
    --green-soft: #dcfce7; --green-text: #15803d;
    --red-soft: #fee2e2; --red-text: #b91c1c;
    --grey-soft: #f1f5f9; --grey-text: #475569;
    --blue-soft: #e0f2fe; --blue-text: #0369a1;
}
.im-page .panel, .im-page .panel-body, .im-page .panel-heading { background: transparent !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }

.im-shell { background: var(--bg); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 12px 32px rgba(2,8,23,.18); overflow: hidden; margin-bottom: 16px; }
html:not(.dark-mode) .im-shell { box-shadow: 0 10px 30px rgba(15,23,42,.06); }

.im-headbar { padding: 20px 24px; display: flex; justify-content: space-between; gap: 14px; align-items: center; flex-wrap: wrap; border-bottom: 1px solid var(--line); }
.im-headbar-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.im-headbar .ico { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; background: var(--brand-soft); color: var(--brand-text); display: inline-flex; align-items: center; justify-content: center; font-size: 17px; }
.im-headbar h1 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.02em; color: var(--text); }
.im-headbar p { margin: 3px 0 0; font-size: 12.5px; color: var(--muted); }
.im-body { padding: 20px 24px 22px; }

.im-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.im-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid transparent; border-radius: 10px; height: 38px; padding: 0 14px; font-size: 12.5px; font-weight: 600; text-decoration: none !important; cursor: pointer; transition: background .15s, border-color .15s, color .15s, box-shadow .15s; white-space: nowrap; }
.im-btn .fa { font-size: 13px; }
.im-btn-ghost { color: var(--text-2) !important; background: var(--panel-2); border-color: var(--line); }
.im-btn-ghost:hover { border-color: var(--muted); color: var(--text) !important; }
.im-btn-primary { background: var(--brand); color: #fff !important; }
.im-btn-primary:hover { background: #ea580c; box-shadow: 0 6px 16px rgba(249,115,22,.25); }
.im-btn-danger { color: var(--red-text) !important; background: var(--red-soft); border-color: transparent; }
.im-btn-danger:hover:not([disabled]) { background: #dc2626; color: #fff !important; }
.im-btn-danger[disabled] { opacity: .45; cursor: not-allowed; }
.im-btn-link { background: transparent; color: var(--muted) !important; padding: 0 8px; }
.im-btn-link:hover { color: var(--text) !important; }

.im-filters { display: grid; grid-template-columns: minmax(220px, 2fr) repeat(4, minmax(130px, 1fr)) auto; gap: 10px; align-items: end; margin-bottom: 18px; }
.im-field label { display: block; font-size: 11px; font-weight: 600; color: var(--muted); margin: 0 0 6px; }
.im-page .form-control { border: 1px solid var(--line); border-radius: 10px; height: 38px; box-shadow: none; background: var(--input); color: var(--text); font-size: 13px; }
.im-page .form-control:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(249,115,22,.15); }
.im-page .form-control::placeholder { color: var(--muted); opacity: .8; }
.im-page select.form-control option { background: var(--input); color: var(--text); }
.im-search { position: relative; }
.im-search .fa { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 13px; pointer-events: none; }
.im-search input { padding-left: 34px; }
.im-filter-actions { display: flex; gap: 4px; }

.im-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.im-stat { display: flex; align-items: center; gap: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; text-decoration: none !important; color: inherit !important; transition: border-color .15s, transform .15s, box-shadow .15s; }
.im-stat:hover { border-color: var(--muted); transform: translateY(-1px); }
.im-stat.active { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(249,115,22,.12); }
.im-stat-ico { width: 40px; height: 40px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.im-stat-ico.t-all { background: var(--brand-soft); color: var(--brand-text); }
.im-stat-ico.t-online { background: var(--green-soft); color: var(--green-text); }
.im-stat-ico.t-offline { background: var(--grey-soft); color: var(--grey-text); }
.im-stat-ico.t-expired { background: var(--red-soft); color: var(--red-text); }
.im-stat-txt { min-width: 0; }
.im-stat-txt span { display: block; color: var(--muted); font-size: 12px; font-weight: 500; }
.im-stat-txt strong { display: block; font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -.02em; color: var(--text); }
.im-stat-txt small { font-size: 11px; color: var(--muted); font-weight: 500; margin-left: 4px; }

.im-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.im-seg { display: inline-flex; background: var(--panel-2); border: 1px solid var(--line); border-radius: 11px; padding: 3px; gap: 2px; }
.im-seg a { display: inline-flex; align-items: center; gap: 7px; padding: 6px 13px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted) !important; text-decoration: none !important; transition: background .15s, color .15s; }
.im-seg a:hover { color: var(--text) !important; }
.im-seg a b { font-weight: 600; font-size: 11px; color: var(--muted); }
.im-seg a.active { background: var(--bg); color: var(--text) !important; box-shadow: 0 1px 3px rgba(2,8,23,.25); }
html:not(.dark-mode) .im-seg a.active { box-shadow: 0 1px 3px rgba(15,23,42,.12); }
.im-seg a.active b { color: var(--brand-text); }
.im-result { font-size: 12.5px; color: var(--muted); }
.im-result strong { color: var(--text); font-weight: 600; }

.im-table-wrap { border: 1px solid var(--line); border-radius: 14px; overflow-x: auto; }
.im-page .table { margin: 0; min-width: 980px; background: transparent; }
.im-page .table > thead > tr > th { background: var(--panel-2); color: var(--muted); font-size: 11px; font-weight: 600; border-bottom: 1px solid var(--line) !important; border-top: 0 !important; white-space: nowrap; padding: 11px 14px; }
.im-page .table > tbody > tr > td { vertical-align: middle !important; border-top: 1px solid var(--line-soft) !important; padding: 13px 14px; font-size: 13px; color: var(--text-2); background: transparent; }
.im-page .table > tbody > tr:first-child > td { border-top: 0 !important; }
.im-page .table > tbody > tr { transition: background .12s; }
.im-page .table > tbody > tr:hover > td { background: var(--panel-2) !important; }

.im-cust { display: flex; align-items: center; gap: 11px; }
.im-av { width: 36px; height: 36px; border-radius: 50%; background: var(--brand-soft); color: var(--brand-text); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.im-name { display: block; font-weight: 600; color: var(--text) !important; line-height: 1.3; }
.im-name:hover { color: var(--brand-text) !important; }
.im-sub { display: block; color: var(--muted); font-size: 11.5px; line-height: 1.4; }
.im-contact div { line-height: 1.4; }
.im-contact .fa { width: 14px; color: var(--muted); font-size: 11px; margin-right: 4px; }
.im-empty { color: var(--muted); }
.im-plan { font-weight: 600; color: var(--text); line-height: 1.35; }
.im-plan.ended { color: var(--muted); font-weight: 500; }

.im-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.im-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.b-online { background: var(--green-soft); color: var(--green-text); }
.b-online .dot { box-shadow: 0 0 0 3px rgba(34,197,94,.2); }
.b-offline { background: var(--grey-soft); color: var(--grey-text); }
.b-expired { background: var(--red-soft); color: var(--red-text); }
.b-hotspot { background: var(--brand-soft); color: var(--brand-text); }
.b-pppoe { background: var(--blue-soft); color: var(--blue-text); }
.b-active { background: var(--green-soft); color: var(--green-text); }
.b-off { background: var(--red-soft); color: var(--red-text); }

.im-dev { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12.5px; white-space: nowrap; }
.im-dev.has { color: var(--text); font-weight: 600; }
.im-dev .fa { font-size: 13px; }
.im-dev.has .fa { color: var(--brand-text); }
.im-date { white-space: nowrap; font-size: 12px; color: var(--muted); }

.im-view { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--line); background: transparent; color: var(--muted) !important; text-decoration: none !important; transition: border-color .15s, color .15s, background .15s; }
.im-view:hover { border-color: var(--brand); color: var(--brand-text) !important; background: var(--brand-soft); }

.im-empty-state { padding: 48px 16px !important; text-align: center; color: var(--muted) !important; }
.im-empty-state .fa { display: block; font-size: 28px; margin-bottom: 10px; opacity: .5; }
.im-page input[type="checkbox"] { accent-color: #f97316; width: 15px; height: 15px; cursor: pointer; vertical-align: middle; }
.im-btn:focus-visible, .im-seg a:focus-visible, .im-stat:focus-visible, .im-view:focus-visible { outline: 3px solid rgba(249,115,22,.35); outline-offset: 2px; }

@media (max-width: 1199px) { .im-filters { grid-template-columns: 1fr 1fr 1fr; } .im-field-search { grid-column: 1 / -1; } }
@media (max-width: 991px) { .im-stats { grid-template-columns: 1fr 1fr; } }
@media (max-width: 767px) {
    .im-headbar, .im-body { padding-left: 16px; padding-right: 16px; }
    .im-filters { grid-template-columns: 1fr 1fr; }
    .im-filter-actions { grid-column: 1 / -1; }
    .im-filter-actions .im-btn-primary { flex: 1; }
}
@media (max-width: 420px) { .im-stats { grid-template-columns: 1fr; } .im-actions { width: 100%; } .im-actions .im-btn { flex: 1 1 auto; } }
</style>

{capture assign=tabq}&search={$search|escape:'url'}&filter={$filter|escape:'url'}&service={$service|escape:'url'}&package={$package|escape:'url'}&order={$order|escape:'url'}&orderby={$orderby|escape:'url'}{/capture}
{capture assign=servq}&search={$search|escape:'url'}&filter={$filter|escape:'url'}&package={$package|escape:'url'}&order={$order|escape:'url'}&orderby={$orderby|escape:'url'}&conn={$conn|escape:'url'}{/capture}
{assign var=cTotal value=$counts.all|default:0}
{assign var=cOnline value=$counts.online|default:0}
{assign var=cOffline value=$counts.offline|default:0}
{assign var=cExpired value=$counts.expired|default:0}
{if $cTotal > 0}
{assign var=pOnline value=($cOnline * 100 / $cTotal)|string_format:"%d"}
{assign var=pOffline value=($cOffline * 100 / $cTotal)|string_format:"%d"}
{assign var=pExpired value=($cExpired * 100 / $cTotal)|string_format:"%d"}
{/if}
{if $conn eq 'online'}{assign var=cShown value=$cOnline}{elseif $conn eq 'offline'}{assign var=cShown value=$cOffline}{elseif $conn eq 'expired'}{assign var=cShown value=$cExpired}{else}{assign var=cShown value=$cTotal}{/if}
{assign var=isAdmin value=in_array($_admin['user_type'], ['SuperAdmin', 'Admin'])}

<div class="row im-page">
    <div class="col-sm-12">
        <div class="im-shell">
            <div class="im-headbar">
                <div class="im-headbar-left">
                    <div class="ico"><i class="fa fa-users" aria-hidden="true"></i></div>
                    <div>
                        <h1>{Lang::T('Customers')}</h1>
                        <p>{Lang::T('Manage and monitor all customers')}</p>
                    </div>
                </div>
                <div class="im-actions">
                    <a class="im-btn im-btn-ghost" href="{Text::url('customers/import')}"><i class="fa fa-file-excel" aria-hidden="true"></i>{Lang::T('Import Excel')}</a>
                    {if $isAdmin}
                    <button type="submit" form="site-search" name="export" value="csv" class="im-btn im-btn-ghost"><i class="fa fa-download" aria-hidden="true"></i>{Lang::T('Export CSV')}</button>
                    <button type="submit" form="bulkDeleteForm" class="im-btn im-btn-danger" id="bulkDeleteBtn" disabled><i class="fa fa-trash-can" aria-hidden="true"></i><span id="bulkDeleteLabel">{Lang::T('Delete')}</span></button>
                    {/if}
                </div>
            </div>

            <div class="im-body">
                <form id="site-search" method="post" action="{Text::url('customers/list')}">
                    <input type="hidden" name="csrf_token" value="{$csrf_token}">
                    <input type="hidden" name="conn" value="{$conn}">
                    <input type="hidden" name="service" value="{$service}">
                    <div class="im-filters">
                        <div class="im-field im-field-search">
                            <label for="customer-search">{Lang::T('Search')}</label>
                            <div class="im-search">
                                <i class="fa fa-search" aria-hidden="true"></i>
                                <input id="customer-search" type="search" name="search" class="form-control" placeholder="Name, username or phone" value="{$search|escape}" autocomplete="off">
                            </div>
                        </div>
                        <div class="im-field">
                            <label for="f-account">{Lang::T('Account')}</label>
                            <select id="f-account" class="form-control" name="filter">
                                <option value="All" {if $filter eq 'All'}selected{/if}>{Lang::T('All')}</option>
                                {foreach $statuses as $status}
                                <option value="{$status}" {if $filter eq $status}selected{/if}>{Lang::T($status)}</option>
                                {/foreach}
                            </select>
                        </div>
                        <div class="im-field">
                            <label for="f-package">{Lang::T('Package')}</label>
                            <select id="f-package" class="form-control" name="package">
                                <option value="">{Lang::T('All packages')}</option>
                                {foreach $plans as $pl}
                                <option value="{$pl}" {if $package eq $pl}selected{/if}>{$pl}</option>
                                {/foreach}
                            </select>
                        </div>
                        <div class="im-field">
                            <label for="f-order">{Lang::T('Sort by')}</label>
                            <select id="f-order" class="form-control" name="order">
                                <option value="username" {if $order eq 'username'}selected{/if}>{Lang::T('Username')}</option>
                                <option value="fullname" {if $order eq 'fullname'}selected{/if}>{Lang::T('Full Name')}</option>
                                <option value="created_at" {if $order eq 'created_at'}selected{/if}>{Lang::T('Created Date')}</option>
                                <option value="status" {if $order eq 'status'}selected{/if}>{Lang::T('Status')}</option>
                            </select>
                        </div>
                        <div class="im-field">
                            <label for="f-orderby">{Lang::T('Order')}</label>
                            <select id="f-orderby" class="form-control" name="orderby">
                                <option value="asc" {if $orderby eq 'asc'}selected{/if}>{Lang::T('Ascending')}</option>
                                <option value="desc" {if $orderby eq 'desc'}selected{/if}>{Lang::T('Descending')}</option>
                            </select>
                        </div>
                        <div class="im-filter-actions">
                            <button class="im-btn im-btn-primary" type="submit"><i class="fa fa-search" aria-hidden="true"></i>{Lang::T('Search')}</button>
                            {if $search neq '' || ($filter neq '' && $filter neq 'All') || $package neq ''}
                            <a class="im-btn im-btn-link" href="{Text::url('customers/list')}&search=&filter=All&package=&service={$service|escape:'url'}&conn={$conn|escape:'url'}" title="{Lang::T('Clear filters')}">{Lang::T('Clear')}</a>
                            {/if}
                        </div>
                    </div>
                </form>

                <div class="im-stats">
                    <a class="im-stat {if $conn eq 'all' || $conn eq ''}active{/if}" href="{Text::url('customers/list')}{$tabq}&conn=all">
                        <span class="im-stat-ico t-all"><i class="fa fa-users" aria-hidden="true"></i></span>
                        <span class="im-stat-txt"><span>{Lang::T('Total Customers')}</span><strong>{$cTotal}</strong></span>
                    </a>
                    <a class="im-stat {if $conn eq 'online'}active{/if}" href="{Text::url('customers/list')}{$tabq}&conn=online">
                        <span class="im-stat-ico t-online"><i class="fa fa-wifi" aria-hidden="true"></i></span>
                        <span class="im-stat-txt"><span>{Lang::T('Online')}</span><strong>{$cOnline}{if $cTotal > 0}<small>({$pOnline}%)</small>{/if}</strong></span>
                    </a>
                    <a class="im-stat {if $conn eq 'offline'}active{/if}" href="{Text::url('customers/list')}{$tabq}&conn=offline">
                        <span class="im-stat-ico t-offline"><i class="fa fa-plug" aria-hidden="true"></i></span>
                        <span class="im-stat-txt"><span>{Lang::T('Offline')}</span><strong>{$cOffline}{if $cTotal > 0}<small>({$pOffline}%)</small>{/if}</strong></span>
                    </a>
                    <a class="im-stat {if $conn eq 'expired'}active{/if}" href="{Text::url('customers/list')}{$tabq}&conn=expired">
                        <span class="im-stat-ico t-expired"><i class="fa fa-clock" aria-hidden="true"></i></span>
                        <span class="im-stat-txt"><span>{Lang::T('Expired')}</span><strong>{$cExpired}{if $cTotal > 0}<small>({$pExpired}%)</small>{/if}</strong></span>
                    </a>
                </div>

                <div class="im-toolbar">
                    <nav class="im-seg" aria-label="{Lang::T('Service')}">
                        <a class="{if $service eq ''}active{/if}" href="{Text::url('customers/list')}{$servq}&service=all">{Lang::T('All services')} <b>{$service_counts.all|default:0}</b></a>
                        <a class="{if $service eq 'Hotspot'}active{/if}" href="{Text::url('customers/list')}{$servq}&service=Hotspot">Hotspot <b>{$service_counts.hotspot|default:0}</b></a>
                        <a class="{if $service eq 'PPPoE'}active{/if}" href="{Text::url('customers/list')}{$servq}&service=PPPoE">PPPoE <b>{$service_counts.pppoe|default:0}</b></a>
                    </nav>
                    <span class="im-result">{Lang::T('Showing')} <strong>{count($d)}</strong> {Lang::T('of')} <strong>{$cShown}</strong> {if $conn eq 'online'}{Lang::T('online')} {elseif $conn eq 'offline'}{Lang::T('offline')} {elseif $conn eq 'expired'}{Lang::T('expired')} {/if}{Lang::T('customers')}</span>
                </div>

                {if $isAdmin}
                <form id="bulkDeleteForm" method="post" action="{Text::url('customers/delete-selected')}" onsubmit="return confirmBulkDelete();">
                    <input type="hidden" name="csrf_token" value="{$csrf_token}">
                {/if}

                <div class="im-table-wrap">
                    <table class="table">
                        <thead>
                            <tr>
                                {if $isAdmin}
                                <th style="width:40px;"><input type="checkbox" id="select-all-customers" aria-label="{Lang::T('Select all')}"></th>
                                {/if}
                                <th>{Lang::T('Customer')}</th>
                                <th>{Lang::T('Contact')}</th>
                                <th>{Lang::T('Package')}</th>
                                <th>{Lang::T('Service')}</th>
                                <th>{Lang::T('Status')}</th>
                                <th>{Lang::T('Devices')}</th>
                                <th>{Lang::T('Account')}</th>
                                <th>{Lang::T('Created')}</th>
                                <th style="width:56px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {foreach $d as $ds}
                            <tr>
                                {if $isAdmin}
                                <td><input type="checkbox" class="customer-select" name="customer_ids[]" value="{$ds['id']}" form="bulkDeleteForm" aria-label="{Lang::T('Select')} {$ds['username']|escape}"></td>
                                {/if}
                                <td>
                                    <div class="im-cust">
                                        <span class="im-av">{$ds['initial']|escape}</span>
                                        <span>
                                            <a class="im-name" href="{Text::url('customers/view/', $ds['id'])}">{$ds['fullname']|default:$ds['username']|escape}</a>
                                            <span class="im-sub">{$ds['username']|escape}</span>
                                        </span>
                                    </div>
                                </td>
                                <td class="im-contact">
                                    {if $ds['phonenumber']}<div><i class="fa fa-phone" aria-hidden="true"></i>{$ds['phonenumber']|escape}</div>{/if}
                                    {if $ds['email']}<div class="im-sub"><i class="fa fa-envelope" aria-hidden="true"></i>{$ds['email']|escape}</div>{/if}
                                    {if !$ds['phonenumber'] && !$ds['email']}<span class="im-empty">—</span>{/if}
                                </td>
                                <td>
                                    {if $ds['pkg_active']}
                                    <div class="im-plan">{$ds['plan_name']|escape}</div>
                                    <span class="im-sub">{$ds['pkg_until']|replace:'Until ':''|escape}</span>
                                    {elseif $ds['plan_name']}
                                    <div class="im-plan ended">{$ds['plan_name']|escape}</div>
                                    <span class="im-sub">{Lang::T('Ended')}</span>
                                    {else}
                                    <span class="im-empty">{Lang::T('No active package')}</span>
                                    {/if}
                                </td>
                                <td>
                                    {if $ds['service_label'] neq '—'}
                                    <span class="im-badge {if $ds['service_class'] eq 'pppoe'}b-pppoe{else}b-hotspot{/if}">{$ds['service_label']|escape}</span>
                                    {else}<span class="im-empty">—</span>{/if}
                                </td>
                                <td>
                                    <span class="im-badge b-{$ds['conn']}" title="{$ds['conn_sub']|escape}"><span class="dot"></span>{Lang::T($ds['conn_label'])}</span>
                                </td>
                                <td>
                                    <span class="im-dev {if $ds['device_count'] > 0}has{/if}"><i class="fa fa-mobile" aria-hidden="true"></i>{$ds['device_count']|default:0}</span>
                                </td>
                                <td>
                                    <span class="im-badge {if $ds['status'] == 'Active'}b-active{else}b-off{/if}">{Lang::T($ds['status'])}</span>
                                </td>
                                <td class="im-date">{Lang::dateTimeFormat($ds['created_at'])}</td>
                                <td>
                                    <a class="im-view" href="{Text::url('customers/view/', $ds['id'])}" title="{Lang::T('View')}" aria-label="{Lang::T('View')} {$ds['username']|escape}"><i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                                </td>
                            </tr>
                            {foreachelse}
                            <tr>
                                <td colspan="10" class="im-empty-state"><i class="fa fa-user" aria-hidden="true"></i>{Lang::T('No customers found')}</td>
                            </tr>
                            {/foreach}
                        </tbody>
                    </table>
                </div>
                {if $isAdmin}
                </form>
                {/if}
                {include file="pagination.tpl"}
            </div>
        </div>
    </div>
</div>

<script>
function confirmBulkDelete() {
    var count = document.querySelectorAll('.customer-select:checked').length;
    if (!count) { alert('{Lang::T('No_customers_selected_for_deletion')}'); return false; }
    return confirm('{Lang::T('Delete')} ' + count + ' {Lang::T('Customer')}(s)?');
}
document.addEventListener('DOMContentLoaded', function () {
    var all = document.getElementById('select-all-customers');
    var btn = document.getElementById('bulkDeleteBtn');
    var label = document.getElementById('bulkDeleteLabel');
    var baseLabel = label ? label.textContent : '';
    function sync() {
        var boxes = document.querySelectorAll('.customer-select');
        var checked = document.querySelectorAll('.customer-select:checked').length;
        if (btn) btn.disabled = checked === 0;
        if (label) label.textContent = checked ? baseLabel + ' (' + checked + ')' : baseLabel;
        if (all) all.checked = boxes.length > 0 && checked === boxes.length;
    }
    if (all) all.addEventListener('change', function () {
        document.querySelectorAll('.customer-select').forEach(function (el) { el.checked = all.checked; });
        sync();
    });
    document.querySelectorAll('.customer-select').forEach(function (el) { el.addEventListener('change', sync); });
    sync();
});
</script>
{include file="sections/footer.tpl"}
