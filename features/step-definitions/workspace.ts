import { Config, configuration } from '@/config';
import { DataTable } from '@cucumber/cucumber';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { afterAll, beforeAll, binding, then } from 'cucumber-tsflow';
import expect from 'expect';
import { Datasource } from 'features/step-definitions/datasource';
import mongoose from 'mongoose';

@binding()
export class Workspace {
  public static responseDtMapType(
    hashedDt: { key: string; value: string; type: string }[],
  ): { key: string; value: any; type: string }[] {
    return hashedDt.map((item) => {
      switch (item.type) {
        case 'number':
          return { ...item, value: +item.value };
        case 'boolean':
          return { ...item, value: item.value === 'true' };
        case 'null':
          return { ...item, value: null };
        case 'undefined':
          return { ...item, value: undefined };
        default:
          return item;
      }
    });
  }

  public datasource: Datasource;

  public response: AxiosResponse<any>;

  public axiosInstance: AxiosInstance;

  public baseURL: string;

  public getAxiosInstance(version?: string) {
    return axios.create({
      baseURL: version ? `${this.baseURL}/api/v${version}` : this.baseURL,
      validateStatus: () => true,
    });
  }

  @beforeAll()
  async beforeAll() {
    const configService = new ConfigService(configuration());
    const mongoUri = configService.get<string>(Config.MONGO_URI);
    const mongoDbName = configService.get<string>(Config.MONGO_DB_NAME);
    this.baseURL = configService.get<string>(Config.BASE_URL);

    const connection = mongoose.createConnection(mongoUri, {
      dbName: mongoDbName,
    });

    this.datasource = await new Datasource(connection).connect();

    this.axiosInstance = this.getAxiosInstance('1');
  }

  @afterAll()
  async afterAll() {
    await this.datasource.disconnect();
  }

  @then('should return status code {int}')
  shouldReturnStatusCode(statusCode: number) {
    expect(this.response.status).toBe(statusCode);
  }

  @then('should appear {string} in response')
  shouldAppearInResponse(key: string) {
    expect(this.response.data).toHaveProperty(key);
  }

  @then('{string} field should not be null in response')
  fieldShouldBeNullInResponse(key: string) {
    expect(this.response.data[key]).not.toBeNull();
  }

  @then('should response data be')
  shouldResponseDataBe(dt: DataTable) {
    const expected = Workspace.responseDtMapType(
      <{ key: string; value: string; type: string }[]>dt.hashes(),
    );

    for (const expectItem of expected) {
      expect(this.response.data[expectItem.key]).toEqual(expectItem.value);
    }
  }

  @then('response size should equal to {int}')
  responseSizeShouldEqualTo(size: number) {
    expect(this.response.data.length).toBe(size);
  }
}
