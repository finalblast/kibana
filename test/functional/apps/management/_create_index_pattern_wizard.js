/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from '@kbn/expect';

export default function ({ getService, getPageObjects }) {
  const kibanaServer = getService('kibanaServer');
  const testSubjects = getService('testSubjects');
  const es = getService('legacyEs');
  const PageObjects = getPageObjects(['settings', 'common']);

  describe('"Create Index Pattern" wizard', function () {
    before(async function () {
      // delete .kibana index and then wait for Kibana to re-create it
      await kibanaServer.uiSettings.replace({});
      await PageObjects.settings.navigateTo();
      await PageObjects.settings.clickKibanaIndexPatterns();
    });

    describe('step 1 next button', function () {
      it('is disabled by default', async function () {
        await (await testSubjects.find('createIndexPatternButton')).click();
        const btn = await PageObjects.settings.getCreateIndexPatternGoToStep2Button();
        const isEnabled = await btn.isEnabled();
        expect(isEnabled).not.to.be.ok();
      });

      it('is enabled once an index pattern with matching indices has been entered', async function () {
        await PageObjects.settings.setIndexPatternField();
        await PageObjects.common.sleep(1000);
        const btn = await PageObjects.settings.getCreateIndexPatternGoToStep2Button();
        const isEnabled = await btn.isEnabled();
        expect(isEnabled).to.be.ok();
      });
    });

    describe('index alias', () => {
      it('can be an index pattern', async () => {
        await es.transport.request({
          path: '/blogs/_doc',
          method: 'POST',
          body: { user: 'matt', message: 20 },
        });

        await es.transport.request({
          path: '/_aliases',
          method: 'POST',
          body: { actions: [{ add: { index: 'blogs', alias: 'alias1' } }] },
        });

        await PageObjects.settings.createIndexPattern('alias1', false);
      });
    });
  });
}
